const jwt = require('jsonwebtoken');
const User = require('../models/User'); // To potentially fetch user details

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (e.g., "Bearer YOUR_TOKEN")
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET);

            // Attach user information to the request object
            // We'll store basic info from the token. If more up-to-date user data is needed,
            // you could fetch the user from the DB here:
            // req.user = await User.findByPk(decoded.id);
            req.user = decoded; // For now, just use the decoded token payload

            next(); // Proceed to the next middleware/route handler
        } catch (error) {
            console.error('Auth middleware error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token.' });
    }
};

// Middleware for role-based authorization
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: You do not have the required role.' });
        }
        next();
    };
};

// Middleware to optionally capture user role/id if token is present, but let requests pass through
const optionalAuthMiddleware = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
        } catch (error) {
            console.warn('Optional authentication token verification failed:', error.message);
        }
    }
    next();
};

module.exports = { authMiddleware, authorizeRoles, optionalAuthMiddleware };