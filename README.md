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

## Phase 2 Implementation Details
- **Access Control Matrix**:
    - Students: Create/Read own documents.
    - Recruiters: Request access; View only if approved.
    - Admins: Manage users and approve access requests.
- **AccessRequest Model**: Tracks relations between recruiters and student documents.
- **ACL Logic**: Centralized in `backend/security/acl.js`.
- **Enforcement**: Routes in `docRoutes.js` and `accessRoutes.js` verify both role and specific ownership/approval status.
