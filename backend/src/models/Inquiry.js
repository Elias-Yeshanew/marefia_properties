const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Listing = require('./Listing');

const Inquiry = sequelize.define('Inquiry', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    type: {
        type: DataTypes.ENUM('inquiry', 'viewing'),
        allowNull: false,
        defaultValue: 'inquiry',
    },
    preferredDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    preferredTime: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('new', 'read', 'responded'),
        allowNull: false,
        defaultValue: 'new',
    },
}, {
    timestamps: true,
});

// Associations
Inquiry.belongsTo(Listing, { foreignKey: 'listingId', as: 'listing', onDelete: 'CASCADE' });
Listing.hasMany(Inquiry, { foreignKey: 'listingId', as: 'inquiries' });

Inquiry.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'SET NULL', constraints: false });
User.hasMany(Inquiry, { foreignKey: 'userId', as: 'inquiries', constraints: false });

module.exports = Inquiry;
