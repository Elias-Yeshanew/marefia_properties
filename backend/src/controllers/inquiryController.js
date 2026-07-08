const inquiryService = require('../services/inquiryService');

const inquiryController = {

    submitInquiry: async (req, res) => {
        try {
            const { listingId, name, email, phone, message, type, preferredDate, preferredTime } = req.body;
            const userId = req.user ? req.user.id : null; // Optional — set if logged in

            const inquiry = await inquiryService.submitInquiry({
                listingId,
                userId,
                name,
                email,
                phone,
                message,
                type,
                preferredDate,
                preferredTime,
            });

            res.status(201).json({
                message: type === 'viewing'
                    ? 'Your viewing request has been submitted. We will contact you shortly to confirm.'
                    : 'Your inquiry has been submitted. We will get back to you soon.',
                inquiry: { id: inquiry.id, type: inquiry.type, status: inquiry.status },
            });
        } catch (error) {
            console.error('Error submitting inquiry:', error);
            res.status(400).json({ message: error.message || 'Failed to submit inquiry.' });
        }
    },

    getAllInquiries: async (req, res) => {
        try {
            const { type, status, listingId } = req.query;
            const inquiries = await inquiryService.getAllInquiries({ type, status, listingId });
            res.status(200).json(inquiries);
        } catch (error) {
            console.error('Error fetching inquiries:', error);
            res.status(500).json({ message: 'Failed to fetch inquiries.' });
        }
    },

    getInquiriesForListing: async (req, res) => {
        try {
            const { listingId } = req.params;
            const inquiries = await inquiryService.getInquiriesForListing(listingId);
            res.status(200).json(inquiries);
        } catch (error) {
            console.error('Error fetching inquiries for listing:', error);
            res.status(500).json({ message: 'Failed to fetch inquiries.' });
        }
    },

    updateInquiryStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const updated = await inquiryService.updateInquiryStatus(id, status);
            res.status(200).json({ message: 'Inquiry status updated.', inquiry: updated });
        } catch (error) {
            console.error('Error updating inquiry status:', error);
            res.status(400).json({ message: error.message || 'Failed to update status.' });
        }
    },
};

module.exports = inquiryController;
