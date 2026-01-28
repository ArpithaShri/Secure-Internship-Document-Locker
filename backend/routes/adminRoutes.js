const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Document = require('../models/Document');

// @desc    Get all users list
// @route   GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all documents list
// @route   GET /api/admin/docs
router.get('/docs', async (req, res) => {
    try {
        const documents = await Document.find({}).populate('uploadedBy', 'username email role');
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
