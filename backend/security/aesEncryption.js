const crypto = require('crypto');
const { SHARED_AES_KEY } = require('./dhKeyExchange');

const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypts a buffer using AES-256-CBC
 * @param {Buffer} buffer - The file content to encrypt
 * @returns {Object} { encryptedData, iv }
 */
const encryptFile = (buffer) => {
    const iv = crypto.randomBytes(16); // Initialization Vector (IV)
    const cipher = crypto.createCipheriv(ALGORITHM, SHARED_AES_KEY, iv);

    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

    return {
        encryptedData: encrypted,
        iv: iv.toString('hex')
    };
};

/**
 * Decrypts an encrypted buffer using AES-256-CBC
 * @param {Buffer} encryptedBuffer - The encrypted data
 * @param {string} ivHex - The IV in hex format
 * @returns {Buffer} - The original file content
 */
const decryptFile = (encryptedBuffer, ivHex) => {
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, SHARED_AES_KEY, iv);

    const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);

    return decrypted;
};

module.exports = {
    encryptFile,
    decryptFile
};
