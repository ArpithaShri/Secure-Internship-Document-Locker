const crypto = require('crypto');

/**
 * Phase 4: Document Hashing
 * Using SHA-256 for high-integrity cryptographic checksums.
 */

const hashDocument = (buffer) => {
    return crypto.createHash('sha256').update(buffer).digest('hex');
};

module.exports = { hashDocument };
