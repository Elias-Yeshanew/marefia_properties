const Listing = require('../models/Listing');
const User = require('../models/User');
const cloudinary = require('../config/cloudinaryConfig')

const listingService = {
    /**
       * Creates a new listing.
       * @param {object} listingData - Data for the new listing (title, description, price, etc.)
       * @param {string} sellerId - The ID of the seller creating the listing.
       * @param {Array<object>} [imageFiles] - Optional array of image file buffers from multer.
       * @returns {object} The created listing object.
       */
    createListing: async (listingData, sellerId, imageFiles = []) => {
        const seller = await User.findByPk(sellerId);
        if (!seller || (seller.role !== 'seller' && seller.role !== 'admin' && seller.role !== 'broker')) {
            throw new Error('Only registered sellers, brokers, or admins can create listings.');
        }

        const imageUrls = [];
        if (imageFiles && imageFiles.length > 0) {
            for (const file of imageFiles) {
                // Upload each file to Cloudinary
                // `buffer.toString('base64')` is needed for Cloudinary upload from memory buffer
                const result = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`, {
                    folder: 'broker-website-listings', // Optional: Folder in Cloudinary to organize images
                });
                imageUrls.push(result.secure_url); // Store the secure URL
            }
        }

        const status = (seller.role === 'admin' || seller.role === 'broker') ? 'approved' : 'pending';

        const newListing = await Listing.create({
            ...listingData,
            sellerId: sellerId,
            images: imageUrls, // Store Cloudinary URLs
            status: status,
        });
        return newListing;
    },



    /**
     * Creates a new listing.
     * @param {object} listingData - Data for the new listing (title, description, price, etc.)
     * @param {string} sellerId - The ID of the seller creating the listing.
     * @returns {object} The created listing object.
     */
    // createListing: async (listingData, sellerId) => {
    //     // Ensure the seller exists and has the 'seller' role
    //     const seller = await User.findByPk(sellerId);
    //     if (!seller || seller.role !== 'seller') {
    //         throw new Error('Only registered sellers can create listings.');
    //     }

    //     const newListing = await Listing.create({
    //         ...listingData,
    //         sellerId: sellerId,
    //         status: 'pending', // All new listings start as 'pending'
    //     });
    //     return newListing;
    // },

    /**
     * Retrieves all approved listings (for public view).
     * Excludes seller PII.
     * @returns {Array<object>} List of approved listings.
     */
    getAllApprovedListings: async () => {
        const listings = await Listing.findAll({
            where: { status: 'approved' },
            attributes: { exclude: ['sellerId', 'createdAt', 'updatedAt'] }, // Exclude sellerId for public
            include: [
                {
                    model: User,
                    as: 'seller',
                    attributes: ['fullName'], // Only include public seller info like full name
                },
            ],
            order: [['createdAt', 'DESC']],
        });
        return listings;
    },

    /**
     * Retrieves a single approved listing by ID (for public view).
     * Excludes seller PII.
     * @param {string} id - Listing ID.
     * @returns {object} The listing object.
     */
    getApprovedListingById: async (id, userId = null, userRole = null) => {
        const listing = await Listing.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'seller',
                    attributes: ['fullName'],
                },
            ],
        });
        if (!listing) {
            throw new Error('Listing not found.');
        }

        // If listing is not approved, only the owner or an admin/broker can view it
        if (listing.status !== 'approved') {
            if (!userId || (listing.sellerId !== userId && userRole !== 'admin' && userRole !== 'broker')) {
                throw new Error('Listing not found or not approved.');
            }
        }

        const plainListing = listing.toJSON();
        
        // Add favorite status flag if userId is provided
        if (userId) {
            const Favorite = require('../models/Favorite');
            const favorite = await Favorite.findOne({
                where: { userId, listingId: id }
            });
            plainListing.isFavorited = !!favorite;
        } else {
            plainListing.isFavorited = false;
        }

        return plainListing;
    },

    /**
     * Retrieves all listings owned by a specific seller.
     * @param {string} sellerId - The ID of the seller.
     * @returns {Array<object>} List of seller's listings.
     */
    getSellerListings: async (sellerId) => {
        const listings = await Listing.findAll({
            where: { sellerId: sellerId },
            // Include all listing attributes and perhaps some basic seller info if desired
            include: [
                {
                    model: User,
                    as: 'seller',
                    attributes: ['fullName', 'email', 'phoneNumber'], // Seller can see their own PII
                },
            ],
            order: [['createdAt', 'DESC']],
        });
        return listings;
    },

    /**
     * Retrieves any listing by ID, including pending ones, with full seller PII.
     * For Admin/Broker view only.
     * @param {string} id - Listing ID.
     * @returns {object} The listing object with full seller details.
     */
    getListingForAdmin: async (id) => {
        const listing = await Listing.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'seller',
                    attributes: ['id', 'fullName', 'email', 'phoneNumber', 'address'], // Full PII for admin
                },
            ],
        });
        if (!listing) {
            throw new Error('Listing not found.');
        }
        return listing;
    },

    /**
     * Updates the status of a listing (e.g., approve, reject).
     * For Admin/Broker only.
     * @param {string} id - Listing ID.
     * @param {string} status - New status ('approved', 'rejected', 'sold', 'rented').
     * @returns {object} The updated listing.
     */
    updateListingStatus: async (id, status) => {
        const listing = await Listing.findByPk(id);
        if (!listing) {
            throw new Error('Listing not found.');
        }

        // Basic validation for status transitions
        const validStatuses = ['pending', 'approved', 'rejected', 'sold', 'rented'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status: ${status}. Must be one of ${validStatuses.join(', ')}.`);
        }

        listing.status = status;
        await listing.save();
        return listing;
    },

    /**
   * Retrieves all listings regardless of status (for Admin/Broker view).
   * @returns {Array<object>} List of all listings.
   */
    getAllListings: async () => {
        const listings = await Listing.findAll({
            // No status filter here, includes all.
            // Exclude seller PII from the initial list view for brevity,
            // but fetch it when specific listing is viewed for details.
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            include: [
                {
                    model: User,
                    as: 'seller',
                    attributes: ['id', 'fullName'], // Only ID and full name for initial list
                },
            ],
            order: [['createdAt', 'DESC']],
        });
        return listings;
    },

    incrementListingViews: async (id) => {
        const listing = await Listing.findByPk(id);
        if (listing) {
            await listing.increment('views');
            await listing.reload();
            return listing;
        }
        return null;
    },

    toggleFavoriteListing: async (userId, listingId) => {
        const Favorite = require('../models/Favorite');
        // Lazy load User and Listing models to make sure associations are initialized
        const User = require('../models/User');
        const Listing = require('../models/Listing');
        
        const existing = await Favorite.findOne({
            where: { userId, listingId }
        });

        if (existing) {
            await existing.destroy();
            return { favorited: false };
        } else {
            await Favorite.create({ userId, listingId });
            return { favorited: true };
        }
    },

    getUserFavoritesListings: async (userId) => {
        const User = require('../models/User');
        const user = await User.findByPk(userId);
        if (!user) return [];
        return await user.getFavoriteListings({
            where: { status: 'approved' },
            joinTableAttributes: [],
            include: [
                {
                    model: User,
                    as: 'seller',
                    attributes: ['fullName'],
                }
            ],
            order: [['createdAt', 'DESC']]
        });
    },

    updateListing: async (id, userId, role, listingData, imageFiles = [], retainedImages = []) => {
        const listing = await Listing.findByPk(id);
        if (!listing) {
            throw new Error('Listing not found.');
        }

        // Authorize: user must be the owner of the listing or an admin
        if (role !== 'admin' && listing.sellerId !== userId) {
            throw new Error('You are not authorized to update this listing.');
        }

        // Upload any new images to Cloudinary
        const newImageUrls = [];
        if (imageFiles && imageFiles.length > 0) {
            for (const file of imageFiles) {
                const result = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`, {
                    folder: 'broker-website-listings',
                });
                newImageUrls.push(result.secure_url);
            }
        }

        // Combine retained images with new uploads
        const finalImages = [...retainedImages, ...newImageUrls];

        // Update fields
        listing.title = listingData.title !== undefined ? listingData.title : listing.title;
        listing.description = listingData.description !== undefined ? listingData.description : listing.description;
        listing.type = listingData.type !== undefined ? listingData.type : listing.type;
        listing.category = listingData.category !== undefined ? listingData.category : listing.category;
        listing.price = listingData.price !== undefined ? parseFloat(listingData.price) : listing.price;
        listing.locationAddressPublic = listingData.locationAddressPublic !== undefined ? listingData.locationAddressPublic : listing.locationAddressPublic;
        listing.images = finalImages;

        // If the editor is a seller, the listing must be re-approved
        if (role !== 'admin') {
            listing.status = 'pending';
        }

        await listing.save();
        return listing;
    },
};

module.exports = listingService;