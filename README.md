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
- **Phase 5: Encoding & Theory**
  - **QR Code Encoding**: Signed documents generate a cryptographic verification token.
  - **Base64 (Transport)**: Verification tokens are encoded/decoded using Base64 for safe network transport.
  - **Security Levels**: Multi-layered defense including Confidentiality, Integrity, Authenticity, and Availability.
  - **Threat Modeling**: Documentation of possible attacks (Brute Force, MITM, Tampering) and their specific mitigations.

## Phase 5 Implementation Details
- **QR Generator**: Uses `qrcode` library to visualize the verification token (`backend/security/encoding.js`).
- **Base64 Utilities**: Native Node.js `Buffer` handles encoding and decoding of JSON verification tokens.

## Security Levels & Risks (Theory)
- **Level 1: Authentication**: Low-level risk managed by bcrypt + OTP. Risk: Password reuse (mitigated by salt).
- **Level 2: Authorization**: Access Control Matrix (ACL) prevents horizontal/vertical escalation. Risk: Misconfigured roles.
- **Level 3: Confidentiality**: AES-256-CBC encryption at rest (Phase 3). Risk: Key management (DH exchange used for mitigation).
- **Level 4: Integrity**: SHA-256 Hashing. Risk: Collision (highly improbable with SHA-256).
- **Level 5: Non-repudiation**: RSA Digital Signatures. Risk: Private key compromise (requires HSM or secure environment).

## Possible Attacks & Mitigations
| Attack Type | Description | Mitigation Strategy |
| :--- | :--- | :--- |
| **Brute Force** | Attempting to guess passwords. | **Bcrypt** complexity + **OTP** MFA. |
| **Rainbow Table** | Using precomputed hashes. | **Salted Hashing** (Unique salt per user). |
| **Document Tampering** | Modifying a resume/letter after upload. | **SHA-256 Integrity** + **Admin Digital Signature**. |
| **Privilege Escalation** | Student trying to access Admin tools. | **ACL Middleware** checking JWT roles server-side. |
| **Replay Attack** | Reusing an intercepted OTP. | **OTP Expiry** timestamp (10-minute window). |
| **Token Forgery** | Creating a fake verification QR. | **RSA Verification** (Decoded token hash must match signed hash). |
