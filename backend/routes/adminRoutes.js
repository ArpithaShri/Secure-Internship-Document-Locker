const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Document = require('../models/Document');
const verifyToken = require('../middleware/verifyToken');

// Middleware to restrict to admin only
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};

// @desc    Get all users list (Admin only)
// @route   GET /api/admin/users
router.get('/users', verifyToken, adminOnly, async (req, res) => {
    try {
        const users = await User.find({}).select('-passwordHash');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all documents list (Admin only)
// @route   GET /api/admin/docs
router.get('/docs', verifyToken, adminOnly, async (req, res) => {
    try {
        const documents = await Document.find({}).populate('uploadedBy', 'username email role');
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
