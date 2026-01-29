# Secure Internship Document Locker (Phase 0)

This is the base application for the Secure Internship Document Locker project. It provides basic user registration, login, and document upload functionality without security features (Phase 0).

## Tech Stack
- **Frontend**: React (Vite) + Axios
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (Mongoose)
- **File Upload**: Multer

## Prerequisites
- Node.js installed
- MongoDB installed and running locally (or update `.env` with your Atlas URI)

## Installation & Setup

### 1. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder (already created) and ensure the `MONGODB_URI` is correct.

### 2. Frontend Setup
```bash
cd frontend
npm install
```

## Running the Application

### Start Backend
```bash
cd backend
npm run dev
```
The server will start on `http://localhost:5000`.

### Start Frontend
```bash
cd frontend
npm run dev
```
The application will be available at `http://localhost:3000`.

## Features
- **Phase 0: Base App**
  - Registration: Register as Student, Recruiter, or Admin.
  - Dashboard: Student upload, viewing documents.
  - Admin Panel: List users and documents.
- **Phase 1: Authentication (NIST SP 800-63 Style)**
  - **Single-Factor**: Secure password hashing with `bcrypt`.
  - **Multi-Factor (MFA)**: Two-step login (Password -> OTP).
  - **JWT Authorization**: Issued after OTP verification; required for all protected API calls.
  - **Role-Based Access**: Restricted Admin routes using middleware.
- **Phase 2: Authorization (Access Control)**
  - **ACL Matrix**: Defined programmatic permissions for Student, Recruiter, and Admin.
  - **Resource Protection**: Enforced document ownership and approval-based access.
  - **Access Requests**: Recruiter request flow with Admin approval system.
  - **Programmatic Enforcement**: `authorize` middleware checks JWT roles against the ACL.
- **Phase 3: Encryption (Diffie-Hellman & AES)**
  - **Key Exchange**: Simulated **Diffie-Hellman (DH)** to derive a shared 256-bit AES key securely.
  - **Encryption at Rest**: Files are encrypted using **AES-256-CBC** before being stored as Binary Buffers in MongoDB.
  - **Zero Static Storage**: No raw files are stored on the server disk; static file serving is disabled for documents.
  - **Secure Decryption**: Authorized users trigger real-time decryption via a protected download endpoint.
- **Phase 4: Digital Signatures & Hashing**
  - **Hashing (Integrity)**: Documents are hashed using **SHA-256** to ensure data integrity.
  - **Salted Hashing (Passwords)**: Passwords are hashed with **bcrypt**, which automatically generates a random salt.
  - **Digital Signature (Authenticity)**: Admin signs the SHA-256 hash of a document using an **RSA Private Key**.
  - **Verification (Non-repudiation)**: Recruiters can verify the signature using the **RSA Public Key** to ensure authenticity.

## Phase 4 Implementation Details
- **Hashing**: SHA-256 is used for both verification and as the digest for signatures (`backend/security/documentHash.js`).
- **RSA Signing**: Admin's private key is used to sign document digests (`backend/security/digitalSignature.js`).
- **Non-repudiation**: Once signed by Admin, the signature proves the document's state and source.

## Viva Explanation: Hashing & Digital Signatures
1.  **What is Hashing with Salt?** Salt is a random value added to a password before hashing. It prevents attackers from using "Rainbow Tables" (precomputed hashes) to crack passwords. Even if two users have the same password, their hashes will be different.
2.  **How do Digital Signatures work?** A digital signature is created by hashing the document and then encrypting that hash with a **Private Key**. Anyone with the corresponding **Public Key** can decrypt the signature and compare it to the document's actual hash to verify its integrity and authenticity.
3.  **Authentication vs. Integrity**: Phase 1 (JWT/Passwords) provides **Authentication** (knowing who you are). Phase 4 Digital Signatures provide **Integrity** (knowing the data hasn't changed) and **Authenticity** (knowing the data came from a trusted source).
4.  **Non-repudiation**: Because only the Admin has the Private Key, they cannot deny having signed the document if the Public Key verification succeeds.
