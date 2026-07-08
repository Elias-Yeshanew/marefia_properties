const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Listing = sequelize.define('Listing', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('house', 'car'),
        allowNull: false,
    },
    category: {
        type: DataTypes.ENUM('for_sale', 'for_rent'),
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    locationAddressPublic: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    images: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
    },
    views: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'sold', 'rented'),
        allowNull: false,
        defaultValue: 'pending'
    },
}, {
    timestamps: true,
});

Listing.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
User.hasMany(Listing, { foreignKey: 'sellerId', as: 'listings' });

module.exports = Listing;