const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Document = require('../models/Document');
const AccessRequest = require('../models/AccessRequest');
const verifyToken = require('../middleware/verifyToken');
const authorize = require('../middleware/authorize');

// Multer Config
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

const upload = multer({ storage });

// @desc    Upload a document (Student Only)
// @route   POST /api/docs/upload
router.post('/upload', verifyToken, upload.single('document'), async (req, res) => {
    try {
        const { title, docType } = req.body;

        // Perform authorization check AFTER multer has parsed the body
        const ACL = require('../security/acl');
        const rolePermissions = ACL.roles[req.user.role];
        const permissions = rolePermissions ? rolePermissions[docType] : null;

        if (!permissions || !permissions.includes('upload')) {
            return res.status(403).json({ error: `Access Denied: Your role cannot upload ${docType}` });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const document = await Document.create({
            title,
            docType,
            filePath: req.file.path,
            uploadedBy: req.user.id, // Enforce ownership from JWT
        });

        res.status(201).json(document);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get documents (Role-based filtering)
// @route   GET /api/docs/all
router.get('/all', verifyToken, async (req, res) => {
    try {
        let query = {};

        // Ownership Enforcement: Students only see their own
        if (req.user.role === 'student') {
            query.uploadedBy = req.user.id;
        }
        // Admin and Recruiter see all (metadata only for Recruiter usually, but we list them all here)

        const documents = await Document.find(query).populate('uploadedBy', 'username email role');

        // If recruiter, we need to attach "access status" to each document
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

// @desc    View specific document (Enforce approval for Recruiter)
// @route   GET /api/docs/view/:id
router.get('/view/:id', verifyToken, async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        // 1. Admin has full access
        if (req.user.role === 'admin') {
            return res.json({ filePath: doc.filePath });
        }

        // 2. Student has access if it's their own
        if (req.user.role === 'student') {
            if (doc.uploadedBy.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Access Denied: Not your document' });
            }
            return res.json({ filePath: doc.filePath });
        }

        // 3. Recruiter has access only if approved
        if (req.user.role === 'recruiter') {
            const approval = await AccessRequest.findOne({
                recruiterId: req.user.id,
                documentId: req.params.id,
                status: 'approved'
            });

            if (!approval) {
                return res.status(403).json({ error: 'Access Denied: Admin approval required' });
            }
            return res.json({ filePath: doc.filePath });
        }

        res.status(403).json({ error: 'Access Denied: Unknown role' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
