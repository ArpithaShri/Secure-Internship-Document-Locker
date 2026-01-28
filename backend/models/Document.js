const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    docType: {
        type: String,
        required: true,
        enum: ['resume', 'offerLetter'],
    },
    // Encryption specific fields
    encryptedData: {
        type: Buffer,
        required: true,
    },
    iv: {
        type: String,
        required: true,
    },
    originalFileName: {
        type: String,
        required: true,
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
