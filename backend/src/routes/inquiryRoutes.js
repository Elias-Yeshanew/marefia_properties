const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');
const { authMiddleware, optionalAuthMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

// Public (with optional auth so logged-in users are identified)
router.post('/', optionalAuthMiddleware, inquiryController.submitInquiry);

// Admin / Broker only
router.get('/admin', authMiddleware, authorizeRoles('admin', 'broker'), inquiryController.getAllInquiries);
router.get('/admin/listing/:listingId', authMiddleware, authorizeRoles('admin', 'broker'), inquiryController.getInquiriesForListing);
router.put('/admin/:id/status', authMiddleware, authorizeRoles('admin', 'broker'), inquiryController.updateInquiryStatus);

module.exports = router;
