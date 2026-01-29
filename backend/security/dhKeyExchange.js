const crypto = require('crypto');

/**
 * Phase 3: Key Exchange (Diffie-Hellman)
 * Using a standard IETF group (modp14) ensures consistency across server 
 * restarts while maintaining NIST-grade security (2048-bit).
 */

const generateServerKeys = () => {
    // Use the standard Oakley Group 14 (2048-bit prime)
    const server = crypto.getDiffieHellman('modp14');
    const serverPublicKey = server.generateKeys();

    return {
        server,
        prime: server.getPrime(),
        generator: server.getGenerator(),
        serverPublicKey
    };
};

const generateClientKeys = (prime, generator) => {
    const client = crypto.getDiffieHellman('modp14');
    const clientPublicKey = client.generateKeys();
    return {
        client,
        clientPublicKey
    };
};

const computeSharedKey = (dhObject, otherPublicKey) => {
    const sharedSecret = dhObject.computeSecret(otherPublicKey);

    // Derive a fixed-length 32-byte AES key using SHA-256
    const aesKey = crypto.createHash('sha256').update(sharedSecret).digest();

    console.log('✅ [CRYPTO] Shared AES Key Established securely via Diffie-Hellman (modp14)');
    return aesKey;
};

// Establish the shared key for the application session
const serverInfo = generateServerKeys();
const clientInfo = generateClientKeys(serverInfo.prime, serverInfo.generator);
const SHARED_AES_KEY = computeSharedKey(serverInfo.server, clientInfo.clientPublicKey);

module.exports = {
    SHARED_AES_KEY,
    generateServerKeys,
    generateClientKeys,
    computeSharedKey
};
