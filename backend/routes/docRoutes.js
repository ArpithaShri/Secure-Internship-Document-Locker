const express = require('express');
const router = express.Router();
const multer = require('multer');
const Document = require('../models/Document');
const AccessRequest = require('../models/AccessRequest');
const verifyToken = require('../middleware/verifyToken');
const { encryptFile, decryptFile } = require('../security/aesEncryption');
const ACL = require('../security/acl');
const { hashDocument } = require('../security/documentHash');
const { verifyHash } = require('../security/digitalSignature');

// Use Memory Storage for Multi-part form data to handle encryption before saving to DB
const storage = multer.memoryStorage();
const upload = multer({ storage });

// @desc    Upload an Encrypted Document (Phase 3)
// @route   POST /api/docs/upload
router.post('/upload', verifyToken, upload.single('document'), async (req, res) => {
    try {
        const { title, docType } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        // 1. Authorization Check (Phase 2)
        const rolePermissions = ACL.roles[req.user.role];
        const permissions = rolePermissions ? rolePermissions[docType] : null;
        if (!permissions || !permissions.includes('upload')) {
            return res.status(403).json({ error: `Access Denied: Your role cannot upload ${docType}` });
        }

        // 2. Encryption (Phase 3)
        const { encryptedData, iv } = encryptFile(req.file.buffer);

        // 3. Save to MongoDB
        const document = await Document.create({
            title,
            docType,
            encryptedData,
            iv,
            originalFileName: req.file.originalname,
            uploadedBy: req.user.id,
        });

        res.status(201).json({
            message: 'Document stored securely (encrypted)',
            id: document._id
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get documents metadata
// @route   GET /api/docs/all
router.get('/all', verifyToken, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'student') {
            query.uploadedBy = req.user.id;
        }

        const documents = await Document.find(query)
            .select('-encryptedData')
            .populate('uploadedBy', 'username email role');

        if (req.user.role === 'recruiter') {
            const requests = await AccessRequest.find({ recruiterId: req.user.id });
            const docsWithStatus = documents.map(doc => {
                const request = requests.find(r => r.documentId.toString() === doc._id.toString());
                return {
                    ...doc.toObject(),
                    accessStatus: request ? request.status : 'none',
                    requestId: request ? request._id : null
                };
            });
            return res.json(docsWithStatus);
        }

        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Download and Decrypt Document (Phase 3)
// @route   GET /api/docs/download/:id
router.get('/download/:id', verifyToken, async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        // 1. Authorization Check (Phase 2)
        let hasAccess = false;
        if (req.user.role === 'admin') hasAccess = true;
        else if (req.user.role === 'student' && doc.uploadedBy.toString() === req.user.id) hasAccess = true;
        else if (req.user.role === 'recruiter') {
            const approval = await AccessRequest.findOne({
                recruiterId: req.user.id,
                documentId: req.params.id,
                status: 'approved'
            });
            if (approval) hasAccess = true;
        }

        if (!hasAccess) {
            return res.status(403).json({ error: 'Access Denied: You do not have permission to download this document' });
        }

        // 2. Decryption (Phase 3)
        const decryptedBuffer = decryptFile(doc.encryptedData, doc.iv);

        // 3. Send File
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${doc.originalFileName}"`,
        });
        res.send(decryptedBuffer);

    } catch (error) {
        console.error('Download Error:', error);
        res.status(500).json({ message: 'Error processing document' });
    }
});

// @desc    Verify document authenticity (Digital Signature Verification)
// @route   GET /api/docs/verify/:id
router.get('/verify/:id', verifyToken, async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        if (!doc.verifiedByAdmin || !doc.adminSignature) {
            return res.json({
                valid: false,
                message: '❌ Document has not been signed by an administrator.'
            });
        }

        // 1. Decrypt document content to get original for hashing
        const decryptedBuffer = decryptFile(doc.encryptedData, doc.iv);

        // 2. Re-compute the hash of the current data
        const currentHash = hashDocument(decryptedBuffer);

        // 3. Verify signature against the hash using RSA Public Key
        const isSignatureValid = verifyHash(currentHash, doc.adminSignature);

        // 4. Check if the hash matches the stored hash (Integrity check)
        const isIntegrityIntact = (currentHash === doc.docHash);

        if (isSignatureValid && isIntegrityIntact) {
            res.json({
                valid: true,
                message: '✅ Signature Verified: Document is Authentic and Untampered.',
                details: {
                    signer: 'Administrator',
                    hash: currentHash
                }
            });
        } else {
            res.json({
                valid: false,
                message: '❌ Signature Invalid: Document may have been modified or signature is tampered.'
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
