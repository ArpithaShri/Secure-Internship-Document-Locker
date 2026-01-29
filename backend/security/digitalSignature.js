const crypto = require('crypto');

/**
 * Phase 4: Digital Signatures (RSA)
 * 
 * Public key cryptography is used to ensure Authenticity and Non-repudiation.
 * The Admin signs with a Private Key, and anyone can verify with the Public Key.
 */

// Generate RSA Key Pair (2048-bit)
// In a production app, these would be loaded from secure .pem files or environment variables.
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});

/**
 * Signs a hash using the Admin's RSA Private Key
 * @param {string} hash - The SHA-256 hash string
 * @returns {string} signature (base64)
 */
const signHash = (hash) => {
    const sign = crypto.createSign('SHA256');
    sign.update(hash);
    sign.end();
    const signature = sign.sign(privateKey, 'base64');
    return signature;
};

/**
 * Verifies a signature using the Admin's RSA Public Key
 * @param {string} hash - The hash that was supposedly signed
 * @param {string} signature - The base64 signature to verify
 * @returns {boolean}
 */
const verifyHash = (hash, signature) => {
    const verify = crypto.createVerify('SHA256');
    verify.update(hash);
    verify.end();
    return verify.verify(publicKey, signature, 'base64');
};

console.log('✅ [CRYPTO] RSA Key Pair Generated for Digital Signatures');

module.exports = {
    signHash,
    verifyHash,
    publicKey // Exporting public key so recruiters can "see" it if needed
};
