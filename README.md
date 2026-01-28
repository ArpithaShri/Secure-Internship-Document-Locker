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

## Phase 3 Implementation Details
- **DH Key Exchange**: Established in `backend/security/dhKeyExchange.js`.
- **AES Module**: Handled in `backend/security/aesEncryption.js` using Node's `crypto` module.
- **IV (Initialization Vector)**: A unique, random IV is generated for every document to ensure ciphertext uniqueness even for identical files.
- **Hybrid Security**: Combines asymmetric-style key exchange (DH) with high-speed symmetric encryption (AES).

## Viva Explanation: Cryptography Policy
1.  **Why Diffie-Hellman?** It allows the server and client (or two processes) to establish a shared secret over an insecure channel without actually sending the key itself.
2.  **Why AES-256-CBC?** AES is the industry standard for symmetric encryption. 256-bit is "Top Secret" grade. CBC mode with IV prevents pattern analysis (Frequency Analysis) attacks.
3.  **Encrypted Storage**: Even if an attacker gains access to the MongoDB database files, they cannot read the documents because the raw data is encrypted.
4.  **Authorized Decryption**: The server only provides the decrypted buffer after checking JWT (Authentication) and ACL/Approval (Authorization).
