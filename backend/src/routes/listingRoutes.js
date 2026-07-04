const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const { authMiddleware, authorizeRoles, optionalAuthMiddleware } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Import the upload middleware

// Public routes (no authentication needed)
router.get('/approved', listingController.getAllApprovedListings);
router.get('/approved/:id', optionalAuthMiddleware, listingController.getApprovedListingById);

// Favorites routes (requires authentication)
router.post('/favorite/:id', authMiddleware, listingController.toggleFavoriteListing);
router.get('/favorites/my', authMiddleware, listingController.getUserFavoritesListings);

// Seller routes (requires authentication and 'seller' role)
router.post('/', authMiddleware, authorizeRoles('seller'), upload.array('images', 5), listingController.createListing);
router.get('/my', authMiddleware, authorizeRoles('seller'), listingController.getSellerListings);

// Admin/Broker routes (requires authentication and 'admin' or 'broker' role)
router.get('/admin/all-listings', authMiddleware, authorizeRoles('admin', 'broker'), listingController.getAllListingsForAdmin);
router.get('/admin/:id', authMiddleware, authorizeRoles('admin', 'broker'), listingController.getListingForAdmin);
router.put('/admin/:id/status', authMiddleware, authorizeRoles('admin', 'broker'), listingController.updateListingStatus);

module.exports = router;