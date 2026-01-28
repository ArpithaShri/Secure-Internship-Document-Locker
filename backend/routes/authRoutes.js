const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Register a new user (with password hashing)
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            email,
            passwordHash,
            role,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Login - Step 1: Verify password and send OTP
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`[AUTH] Login attempt for: ${email}`);

        const user = await User.findOne({ email });

        if (!user) {
            console.log(`[AUTH] User not found: ${email}`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if this is an old Phase 0 user (has 'password' field but no 'passwordHash')
        // We use .toObject() to see fields not in the current strict schema
        const userObj = user.toObject();
        if (userObj.password && !user.passwordHash) {
            console.log(`[AUTH] Legacy Phase 0 user detected. Redirection to re-registration required.`);
            return res.status(401).json({ message: 'Legacy account detected. Please register again.' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        console.log(`[AUTH] Password match result: ${isMatch}`);

        if (isMatch) {
            // Generate 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

            user.otpCode = otp;
            user.otpExpiry = otpExpiry;
            await user.save();

            console.log(`[AUTH] OTP generated for ${user.email} is: ${otp}`);

            res.json({
                message: 'OTP sent',
                userId: user._id,
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(`[AUTH] Error during login: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Login - Step 2: Verify OTP and issue JWT
// @route   POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
    try {
        const { userId, otpCode } = req.body;

        const user = await User.findById(userId);

        if (!user || user.otpCode !== otpCode || new Date() > user.otpExpiry) {
            return res.status(401).json({ message: 'Invalid or expired OTP' });
        }

        // Clear OTP after successful verification
        user.otpCode = undefined;
        user.otpExpiry = undefined;
        await user.save();

        // Issue JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '30d' }
        );

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: token,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
