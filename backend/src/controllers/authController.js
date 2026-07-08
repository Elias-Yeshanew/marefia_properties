const authService = require('../services/authService');
const User = require('../models/User'); // Import User model to fetch user details

const authController = {
    /**
     * POST /api/auth/register
     * Registers a new user.
     */
    register: async (req, res) => {
        try {
            const { email, password, fullName, role, phoneNumber, address } = req.body;

            // Basic validation
            if (!email || !password || !fullName || !role) {
                return res.status(400).json({ message: 'All fields are required.' });
            }

            // Ensure role is valid for registration
            if (!['customer', 'seller'].includes(role)) {
                return res.status(400).json({ message: 'Invalid role specified.' });
            }

            const newUser = await authService.registerUser(email, password, fullName, role, phoneNumber, address);
            res.status(201).json({
                message: 'User registered successfully!',
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    fullName: newUser.fullName,
                    role: newUser.role,
                    phoneNumber: newUser.phoneNumber,
                    address: newUser.address,
                },
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    /**
     * POST /api/auth/login
     * Logs in a user and returns a JWT token.
     */
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required.' });
            }

            const token = await authService.loginUser(email, password);
            res.status(200).json({ message: 'Logged in successfully!', token });
        } catch (error) {
            res.status(401).json({ message: error.message }); // 401 Unauthorized for login failures
        }
    },

    /**
     * GET /api/auth/me
     * Retrieves the currently authenticated user's profile.
     * This endpoint will be protected by middleware.
     */
    getMe: async (req, res) => {
        try {
            // req.user will be populated by our authentication middleware
            const user = await User.findByPk(req.user.id, {
                attributes: ['id', 'email', 'fullName', 'phoneNumber', 'address', 'role', 'createdAt'],
            });

            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            res.status(200).json({ user });
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch user profile.', error: error.message });
        }
    },
};

module.exports = authController;