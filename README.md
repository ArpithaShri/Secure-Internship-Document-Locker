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
- **Registration**: Register as Student, Recruiter, or Admin.
- **Login**: Basic email/password login (plaintext).
- **Dashboard**:
  - Students can upload Resume/Offer Letter.
  - All users can view the list of uploaded documents.
- **Admin Panel**: Admin users can view all registered users and all uploaded documents.
- **File Storage**: Documents are stored in the `backend/uploads` folder.
