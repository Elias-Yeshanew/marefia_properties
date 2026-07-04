const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Listing = require('./Listing');

const Favorite = sequelize.define('Favorite', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
}, {
    timestamps: true,
});

// Establish Many-to-Many associations
User.belongsToMany(Listing, { through: Favorite, as: 'favoriteListings', foreignKey: 'userId' });
Listing.belongsToMany(User, { through: Favorite, as: 'favoritedBy', foreignKey: 'listingId' });

module.exports = Favorite;
