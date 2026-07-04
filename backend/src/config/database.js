const { Sequelize } = require('sequelize');
require('dotenv').config(); // Ensure environment variables are loaded here too

// Database connection parameters from .env
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432; // Default PostgreSQL port

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'postgres',
    logging: false, // Set to true to see SQL queries in console
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        // Load models to ensure they are registered with Sequelize before sync
        require('../models/User');
        require('../models/Listing');
        require('../models/Favorite');

        // Synchronize database schema changes automatically
        await sequelize.sync({ alter: true });
        console.log('Database schema synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1); // Exit process with failure
    }
};

module.exports = { sequelize, connectDB };