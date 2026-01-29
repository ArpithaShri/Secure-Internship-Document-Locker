const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Document = require('../models/Document');
const verifyToken = require('../middleware/verifyToken');
const { hashDocument } = require('../security/documentHash');
const { signHash } = require('../security/digitalSignature');
const { decryptFile } = require('../security/aesEncryption');

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

// @desc    Admin signs a document hash (Digital Signature)
// @route   POST /api/admin/sign-document/:docId
router.post('/sign-document/:docId', verifyToken, adminOnly, async (req, res) => {
    try {
        const doc = await Document.findById(req.params.docId);
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        // 1. Decrypt the file to get the original content for hashing
        const decryptedBuffer = decryptFile(doc.encryptedData, doc.iv);

        // 2. Compute SHA-256 Hash
        const hash = hashDocument(decryptedBuffer);

        // 3. Sign Hash with Admin RSA Private Key
        const signature = signHash(hash);

        // 4. Update Document with hash and signature
        doc.docHash = hash;
        doc.adminSignature = signature;
        doc.verifiedByAdmin = true;
        await doc.save();

        res.json({
            message: '✅ Document Verified & Signed by Admin',
            hash: hash,
            signature: signature
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
