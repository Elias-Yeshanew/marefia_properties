const Inquiry = require('../models/Inquiry');
const Listing = require('../models/Listing');
const User = require('../models/User');

const inquiryService = {

    submitInquiry: async ({ listingId, userId, name, email, phone, message, type, preferredDate, preferredTime }) => {
        // Validate listing exists
        const listing = await Listing.findByPk(listingId);
        if (!listing) throw new Error('Listing not found.');

        if (!name || !email) throw new Error('Name and email are required.');
        if (!['inquiry', 'viewing'].includes(type)) throw new Error('Invalid inquiry type.');
        if (type === 'viewing' && !preferredDate) throw new Error('Preferred date is required for viewing requests.');

        const inquiry = await Inquiry.create({
            listingId,
            userId: userId || null,
            name,
            email,
            phone: phone || null,
            message: message || null,
            type,
            preferredDate: preferredDate || null,
            preferredTime: preferredTime || null,
            status: 'new',
        });

        return inquiry;
    },

    getAllInquiries: async ({ type, status, listingId } = {}) => {
        const where = {};
        if (type) where.type = type;
        if (status) where.status = status;
        if (listingId) where.listingId = listingId;

        const inquiries = await Inquiry.findAll({
            where,
            include: [
                {
                    model: Listing,
                    as: 'listing',
                    attributes: ['id', 'title', 'type', 'locationAddressPublic'],
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'fullName', 'email'],
                    required: false,
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        return inquiries;
    },

    getInquiriesForListing: async (listingId) => {
        const inquiries = await Inquiry.findAll({
            where: { listingId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'fullName', 'email'],
                    required: false,
                },
            ],
            order: [['createdAt', 'DESC']],
        });
        return inquiries;
    },

    updateInquiryStatus: async (id, status) => {
        if (!['new', 'read', 'responded'].includes(status)) {
            throw new Error('Invalid status. Use: new, read, or responded.');
        }
        const inquiry = await Inquiry.findByPk(id);
        if (!inquiry) throw new Error('Inquiry not found.');
        inquiry.status = status;
        await inquiry.save();
        return inquiry;
    },
};

module.exports = inquiryService;
