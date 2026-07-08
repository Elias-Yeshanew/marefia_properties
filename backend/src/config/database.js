const { Sequelize } = require('sequelize');
require('dotenv').config(); // Ensure environment variables are loaded here too

// Check if a database connection URL is provided (e.g. Neon, Heroku, Render)
const dbUrl = process.env.DATABASE_URL || process.env.DB_URL;
let sequelize;

if (dbUrl) {
    sequelize = new Sequelize(dbUrl, {
        dialect: 'postgres',
        logging: false, // Set to true to see SQL queries in console
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false, // Needed for Neon DB and cloud Postgres hosts
            },
        },
    });
} else {
    // Database connection parameters from .env (Local Development)
    const DB_NAME = process.env.DB_NAME;
    const DB_USER = process.env.DB_USER;
    const DB_PASSWORD = process.env.DB_PASSWORD;
    const DB_HOST = process.env.DB_HOST || 'localhost';
    const DB_PORT = process.env.DB_PORT || 5432; // Default PostgreSQL port

    sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
        host: DB_HOST,
        port: DB_PORT,
        dialect: 'postgres',
        logging: false,
    });
}

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        // Load models to ensure they are registered with Sequelize before sync
        require('../models/User');
        require('../models/Listing');
        require('../models/Favorite');
        require('../models/Inquiry');

        // Manually add any new columns that alter:true struggles with on first run
        await sequelize.query(`
            ALTER TABLE "Listings"
            ADD COLUMN IF NOT EXISTS "locationAddressPublic" VARCHAR(255);
        `).catch(() => {}); // Silently ignore if the table doesn't exist yet (first run)

        // Pre-create ENUM types for Inquiry table (prevents alter:true conflicts)
        await sequelize.query(`
            DO $$ BEGIN
                CREATE TYPE "enum_Inquiries_type" AS ENUM ('inquiry', 'viewing');
            EXCEPTION WHEN duplicate_object THEN NULL;
            END $$;
        `).catch(() => {});
        await sequelize.query(`
            DO $$ BEGIN
                CREATE TYPE "enum_Inquiries_status" AS ENUM ('new', 'read', 'responded');
            EXCEPTION WHEN duplicate_object THEN NULL;
            END $$;
        `).catch(() => {});

        // Synchronize database schema changes automatically
        await sequelize.sync({ alter: true });
        console.log('Database schema synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1); // Exit process with failure
    }
};

module.exports = { sequelize, connectDB };