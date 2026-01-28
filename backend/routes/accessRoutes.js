const express = require('express');
const router = express.Router();
const AccessRequest = require('../models/AccessRequest');
const Document = require('../models/Document');
const verifyToken = require('../middleware/verifyToken');
const authorize = require('../middleware/authorize');

// @desc    Recruiter requests access to a document
// @route   POST /api/access/request
router.post('/request', verifyToken, authorize('resume', 'view_approved'), async (req, res) => {
    try {
        const { documentId } = req.body;

        const doc = await Document.findById(documentId);
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        // Check if request already exists
        const existing = await AccessRequest.findOne({ recruiterId: req.user.id, documentId });
        if (existing) return res.status(400).json({ message: 'Request already exists' });

        const request = await AccessRequest.create({
            recruiterId: req.user.id,
            studentId: doc.uploadedBy,
            documentId,
            status: 'pending'
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Admin reviews/approves access (Admin Only)
// @route   POST /api/access/approve/:id
router.post('/approve/:id', verifyToken, authorize('user', 'manage'), async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        const request = await AccessRequest.findById(req.params.id);

        if (!request) return res.status(404).json({ message: 'Request not found' });

        request.status = status;
        await request.save();

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all pending requests (Admin Only)
// @route   GET /api/access/all
router.get('/all', verifyToken, authorize('user', 'manage'), async (req, res) => {
    try {
        const requests = await AccessRequest.find({})
            .populate('recruiterId', 'username email')
            .populate('studentId', 'username email')
            .populate('documentId', 'title docType');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
