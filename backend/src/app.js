require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Allow requests from specified origins (comma-separated in env) or default local server
const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim().replace(/\/$/, ''))
    : ['http://localhost:5173'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, Postman, or curl)
        if (!origin) return callback(null, true);
        
        // Normalize origin by stripping trailing slash (though browsers usually don't send one)
        const normalizedOrigin = origin.replace(/\/$/, '');
        
        if (allowedOrigins.includes(normalizedOrigin) || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            console.error(`[CORS Error] Origin '${origin}' is not allowed. Allowed origins configured in FRONTEND_URL:`, allowedOrigins);
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
    },
    credentials: true,
}));

// Middleware to parse JSON bodies from incoming requests
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
    res.send('Welcome to the Broker Website Backend!');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);

// Start the server only after DB connects
const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Access it at: http://localhost:${PORT}`);
    });
};

startServer();