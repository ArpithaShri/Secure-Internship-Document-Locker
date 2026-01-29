const QRCode = require('qrcode');

/**
 * Phase 5: Encoding & Decoding
 * Implementing Base64 for transport and QR Codes for verification.
 */

/**
 * Encodes text to Base64
 * @param {string} text 
 * @returns {string} base64 encoded string
 */
const encodeBase64 = (text) => {
    return Buffer.from(text).toString('base64');
};

/**
 * Decodes Base64 to text
 * @param {string} encoded 
 * @returns {string} decoded text
 */
const decodeBase64 = (encoded) => {
    return Buffer.from(encoded, 'base64').toString('utf8');
};

/**
 * Generates a QR Code Data URL from text
 * @param {string} text 
 * @returns {Promise<string>} QR Code Data URL
 */
const generateQRCode = async (text) => {
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(text);
        return qrCodeDataUrl;
    } catch (err) {
        console.error('QR Code Generation Error:', err);
        throw err;
    }
};

module.exports = {
    encodeBase64,
    decodeBase64,
    generateQRCode
};
