const listingService = require('../services/listingService');
const cache = require('../utils/cache');

const listingController = {
    /**
     * POST /api/listings
     * Creates a new listing. Requires 'seller' role.
     */

    createListing: async (req, res) => {
        try {
            const { id: sellerId, role } = req.user;

            if (role !== 'seller') {
                return res.status(403).json({ message: 'Only sellers can create listings.' });
            }

            // Extract text fields from req.body (parsed by multer)
            const { title, description, type, category, price, locationAddressPublic } = req.body;
            const imageFiles = req.files; // Files are now available here thanks to multer

            // Basic validation
            if (!title || !description || !type || !category || !price || !locationAddressPublic) {
                // If files were uploaded but other data is missing, we might need to delete them from Cloudinary later
                // For now, this is a basic check.
                return res.status(400).json({ message: 'Missing required listing fields.' });
            }
            if (!['house', 'car'].includes(type)) return res.status(400).json({ message: 'Invalid listing type.' });
            if (!['for_sale', 'for_rent'].includes(category)) return res.status(400).json({ message: 'Invalid listing category.' });
            if (isNaN(parseFloat(price))) return res.status(400).json({ message: 'Price must be a number.' });


            const listingData = {
                title,
                description,
                type,
                category,
                price: parseFloat(price),
                locationAddressPublic,
                // images array will be handled by the service now, based on uploaded files
            };

            const newListing = await listingService.createListing(listingData, sellerId, req.files);
            res.status(201).json({
                message: 'Listing created successfully and is awaiting approval.',
                listing: {
                    id: newListing.id,
                    title: newListing.title,
                    status: newListing.status,
                    images: newListing.images, // Return the URLs from Cloudinary
                    createdAt: newListing.createdAt,
                },
            });
        } catch (error) {
            console.error('Error creating listing with image upload:', error);
            res.status(400).json({ message: error.message || 'Failed to create listing.' });
        }
    },

    // createListing: async (req, res) => {
    //     try {
    //         // req.user is populated by authMiddleware and has id, email, role
    //         const { id: sellerId, role } = req.user;

    //         if (role !== 'seller') {
    //             return res.status(403).json({ message: 'Only sellers can create listings.' });
    //         }

    //         const { title, description, type, category, price, locationAddressPublic, images } = req.body;

    //         // Basic validation
    //         if (!title || !description || !type || !category || !price || !locationAddressPublic) {
    //             return res.status(400).json({ message: 'Missing required listing fields.' });
    //         }
    //         if (!['house', 'car'].includes(type)) return res.status(400).json({ message: 'Invalid listing type.' });
    //         if (!['for_sale', 'for_rent'].includes(category)) return res.status(400).json({ message: 'Invalid listing category.' });
    //         if (isNaN(parseFloat(price))) return res.status(400).json({ message: 'Price must be a number.' });


    //         const listingData = {
    //             title,
    //             description,
    //             type,
    //             category,
    //             price: parseFloat(price),
    //             locationAddressPublic,
    //             images: images || [],
    //         };

    //         const newListing = await listingService.createListing(listingData, sellerId);
    //         res.status(201).json({
    //             message: 'Listing created successfully and is awaiting approval.',
    //             listing: {
    //                 id: newListing.id,
    //                 title: newListing.title,
    //                 status: newListing.status,
    //                 createdAt: newListing.createdAt,
    //             },
    //         });
    //     } catch (error) {
    //         console.error('Error creating listing:', error);
    //         res.status(400).json({ message: error.message });
    //     }
    // },

    /**
     * GET /api/listings/approved
     * Retrieves all approved listings for public view.
     */
    getAllApprovedListings: async (req, res) => {
        try {
            const cacheKey = 'approved_listings';
            const cachedData = cache.get(cacheKey);
            if (cachedData) {
                return res.status(200).json(cachedData);
            }

            const listings = await listingService.getAllApprovedListings();
            cache.set(cacheKey, listings); // Default 5 mins TTL
            res.status(200).json(listings);
        } catch (error) {
            console.error('Error fetching approved listings:', error);
            res.status(500).json({ message: 'Failed to retrieve listings.', error: error.message });
        }
    },

    /**
     * GET /api/listings/approved/:id
     * Retrieves a single approved listing by ID for public view.
     * Optionally takes user authentication to return isFavorited status.
     */
    getApprovedListingById: async (req, res) => {
        try {
            const userId = req.user ? req.user.id : null;
            const cacheKey = `approved_listing_${req.params.id}`;
            const cachedData = cache.get(cacheKey);

            if (cachedData) {
                // Background increment views to database and update cache
                listingService.incrementListingViews(req.params.id).then((updatedListing) => {
                    if (updatedListing) {
                        // Exclude updatedAt/createdAt fields as original getApprovedListingById did
                        const cleanListing = updatedListing.toJSON();
                        delete cleanListing.sellerId;
                        delete cleanListing.updatedAt;
                        cache.set(cacheKey, cleanListing);
                    }
                }).catch(err => console.error('Error background-incrementing views:', err));

                // Personalize favorited state dynamically
                const personalizedData = { ...cachedData };
                if (userId) {
                    const Favorite = require('../models/Favorite');
                    const favorite = await Favorite.findOne({ where: { userId, listingId: req.params.id } });
                    personalizedData.isFavorited = !!favorite;
                } else {
                    personalizedData.isFavorited = false;
                }

                return res.status(200).json(personalizedData);
            }

            // Cache miss: sync flow
            await listingService.incrementListingViews(req.params.id);
            const listing = await listingService.getApprovedListingById(req.params.id, userId);

            // Store in cache with isFavorited = false (for general public caching)
            const publicListing = { ...listing, isFavorited: false };
            cache.set(cacheKey, publicListing);

            res.status(200).json(listing);
        } catch (error) {
            console.error('Error fetching approved listing by ID:', error);
            res.status(404).json({ message: error.message });
        }
    },

    /**
     * GET /api/listings/my
     * Retrieves all listings belonging to the authenticated seller.
     * Requires 'seller' role.
     */
    getSellerListings: async (req, res) => {
        try {
            const { id: sellerId, role } = req.user;

            if (role !== 'seller') {
                return res.status(403).json({ message: 'Only sellers can view their own listings.' });
            }

            const listings = await listingService.getSellerListings(sellerId);
            res.status(200).json(listings);
        } catch (error) {
            console.error('Error fetching seller listings:', error);
            res.status(500).json({ message: 'Failed to retrieve seller listings.', error: error.message });
        }
    },

    /**
     * GET /api/admin/listings/:id
     * Retrieves a single listing for admin/broker view, including seller PII.
     * Requires 'admin' or 'broker' role.
     */
    getListingForAdmin: async (req, res) => {
        try {
            const listing = await listingService.getListingForAdmin(req.params.id);
            res.status(200).json(listing);
        } catch (error) {
            console.error('Error fetching listing for admin:', error);
            res.status(404).json({ message: error.message });
        }
    },

    /**
     * PUT /api/admin/listings/:id/status
     * Updates the status of a listing. Requires 'admin' or 'broker' role.
     */
    updateListingStatus: async (req, res) => {
        try {
            const { status } = req.body;
            if (!status) {
                return res.status(400).json({ message: 'New status is required.' });
            }
            const updatedListing = await listingService.updateListingStatus(req.params.id, status);
            
            // Invalidate approved listings caches
            cache.delete('approved_listings');
            cache.delete(`approved_listing_${req.params.id}`);

            res.status(200).json({
                message: `Listing status updated to ${updatedListing.status}.`,
                listing: {
                    id: updatedListing.id,
                    status: updatedListing.status,
                    title: updatedListing.title
                }
            });
        } catch (error) {
            console.error('Error updating listing status:', error);
            res.status(400).json({ message: error.message });
        }
    },

    toggleFavoriteListing: async (req, res) => {
        try {
            const userId = req.user.id;
            const listingId = req.params.id;
            const result = await listingService.toggleFavoriteListing(userId, listingId);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error toggling favorite listing:', error);
            res.status(400).json({ message: error.message });
        }
    },

    getUserFavoritesListings: async (req, res) => {
        try {
            const userId = req.user.id;
            const listings = await listingService.getUserFavoritesListings(userId);
            res.status(200).json(listings);
        } catch (error) {
            console.error('Error fetching user favorites listings:', error);
            res.status(500).json({ message: 'Failed to retrieve favorites.', error: error.message });
        }
    },

    getAllListingsForAdmin: async (req, res) => {
        try {
            const listings = await listingService.getAllListings();
            res.status(200).json(listings);
        } catch (error) {
            console.error('Error fetching all listings for admin:', error);
            res.status(500).json({ message: 'Failed to retrieve all listings.', error: error.message });
        }
    },

};

module.exports = listingController;