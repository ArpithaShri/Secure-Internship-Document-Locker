const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Document = require('../models/Document');

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

// @desc    Upload a document
// @route   POST /api/docs/upload
router.post('/upload', upload.single('document'), async (req, res) => {
    try {
        const { title, docType, uploadedBy } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const document = await Document.create({
            title,
            docType,
            filePath: req.file.path,
            uploadedBy,
        });

        res.status(201).json(document);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all documents
// @route   GET /api/docs/all
router.get('/all', async (req, res) => {
    try {
        const documents = await Document.find({}).populate('uploadedBy', 'username email');
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
