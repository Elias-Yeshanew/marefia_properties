const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

const authService = {
    /**
   * Registers a new user.
   * @param {string} email
   * @param {string} password
   * @param {string} fullName
   * @param {string} role ('customer' or 'seller')
   * @returns {object} new user object
   */

    registerUser: async (email, password, fullName, role, phoneNumber, address) => {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new Error('User with this email already exists.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            email,
            password: hashedPassword,
            fullName,
            role,
            phoneNumber,
            address,
        });

        return newUser;
    },

    /**
   * Logs in a user and returns a JWT token.
   * @param {string} email
   * @param {string} password
   * @returns {object} user and token
   */
    loginUser: async (email, password) => {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error('Invalid credentials.');
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET, { expiresIn: '1h' }
        );

        return token;
    },

    verifyToken: (token) => {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            return decoded;
        } catch (error) {
            throw new Error('Invalid or expired token.');
        }
    },
};

module.exports = authService;