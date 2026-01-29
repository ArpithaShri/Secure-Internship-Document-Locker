import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [uploadData, setUploadData] = useState({ title: '', docType: 'resume' });
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser) {
            navigate('/login');
        } else {
            setUser(storedUser);
            fetchDocuments();
        }
    }, [navigate]);

    const fetchDocuments = async () => {
        try {
            const res = await api.get('/docs/all');
            setDocuments(res.data);
        } catch (err) {
            console.error('Failed to fetch docs');
        }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('document', file);
        formData.append('title', uploadData.title);
        formData.append('docType', uploadData.docType);

        try {
            await api.post('/docs/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessage('Document uploaded successfully!');
            setUploadData({ title: '', docType: 'resume' });
            setFile(null);
            fetchDocuments();
        } catch (err) {
            setMessage(err.response?.data?.error || 'Upload failed');
        }
    };

    const requestAccess = async (docId) => {
        try {
            await api.post('/access/request', { documentId: docId });
            setMessage('Access request sent to admin!');
            fetchDocuments();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Request failed');
        }
    };

    const viewDocument = async (docId, fileName) => {
        try {
            const res = await api.get(`/docs/download/${docId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName || 'document.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Access Denied: You do not have permission or approval to view this document');
        }
    };

    const handleVerifyDocument = async (docId) => {
        try {
            const res = await api.get(`/docs/verify/${docId}`);
            alert(res.data.message);
        } catch (err) {
            alert('Verification service failed');
        }
    };

    const [showQRCode, setShowQRCode] = useState(false);
    const [qrData, setQrData] = useState({ code: '', token: '' });
    const [decodedToken, setDecodedToken] = useState(null);

    const logout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleShowQR = async (docId) => {
        try {
            const res = await api.get(`/docs/qr/${docId}`);
            setQrData({ code: res.data.qrCode, token: res.data.encodedToken });
            setShowQRCode(true);
            setDecodedToken(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to generate QR code');
        }
    };

    const handleDecodeToken = async () => {
        try {
            const res = await api.post('/docs/decode', { encodedToken: qrData.token });
            setDecodedToken(res.data);
        } catch (err) {
            alert('Failed to decode token');
        }
    };

    if (!user) return null;

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div className="header-content">
                    <h1>Welcome, {user.username}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span className={`status-badge role-${user.role}`}>{user.role}</span>
                    <button onClick={logout} className="btn btn-secondary">Logout</button>
                    {user.role === 'admin' && <button onClick={() => navigate('/admin')} className="btn">Admin Panel</button>}
                </div>
            </div>

            {message && (
                <div className={`alert ${message.toLowerCase().includes('success') || message.toLowerCase().includes('sent') ? 'alert-success' : 'alert-error'}`}>
                    {message.toLowerCase().includes('success') ? '✅ ' : '⚠️ '} {message}
                </div>
            )}

            {user.role === 'student' && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3>Upload New Document</h3>
                    <form onSubmit={handleFileUpload} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Title</label>
                            <input type="text" placeholder="Resume 2024" value={uploadData.title} onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })} required />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Type</label>
                            <select value={uploadData.docType} onChange={(e) => setUploadData({ ...uploadData, docType: e.target.value })}>
                                <option value="resume">Resume</option>
                                <option value="offerLetter">Offer Letter</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>File</label>
                            <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
                        </div>
                        <button type="submit" className="btn">Upload Document</button>
                    </form>
                </div>
            )}

            <div className="card">
                <h3>{user.role === 'student' ? 'My Documents' : 'Available Documents'}</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Uploaded By</th>
                            {user.role === 'recruiter' && <th>Access Status</th>}
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.length > 0 ? documents.map((doc) => (
                            <tr key={doc._id}>
                                <td>{doc.title}</td>
                                <td>{doc.docType}</td>
                                <td>{doc.uploadedBy?.username || 'Unknown'}</td>
                                {user.role === 'recruiter' && (
                                    <td>
                                        <span className={`status-badge`} style={{
                                            backgroundColor: doc.accessStatus === 'approved' ? 'rgba(16, 185, 129, 0.1)' : doc.accessStatus === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                                            color: doc.accessStatus === 'approved' ? '#10b981' : doc.accessStatus === 'pending' ? '#f59e0b' : '#94a3b8',
                                            border: `1px solid ${doc.accessStatus === 'approved' ? 'rgba(16, 185, 129, 0.2)' : doc.accessStatus === 'pending' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(148, 163, 184, 0.2)'}`
                                        }}>
                                            {doc.accessStatus}
                                        </span>
                                    </td>
                                )}
                                <td>
                                    {user.role === 'recruiter' && doc.accessStatus === 'none' ? (
                                        <button onClick={() => requestAccess(doc._id)} className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Request Access</button>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => viewDocument(doc._id, doc.originalFileName)} className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>View</button>
                                            {(user.role === 'recruiter' || user.role === 'admin') && doc.verifiedByAdmin && (
                                                <button onClick={() => handleShowQR(doc._id)} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', borderColor: 'var(--accent)', color: 'var(--accent)' }}>Verify QR</button>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No documents found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showQRCode && (
                <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <h3>Document Verification QR</h3>
                    <div style={{ background: 'white', padding: '1.5rem', display: 'inline-block', borderRadius: '1rem', margin: '1rem 0' }}>
                        <img src={qrData.code} alt="Verification QR" />
                    </div>
                    <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <button onClick={handleDecodeToken} className="btn">Decode Token (Base64)</button>
                        <button onClick={() => setShowQRCode(false)} className="btn btn-secondary">Close</button>
                    </div>
                    {decodedToken && (
                        <div style={{ textAlign: 'left', background: 'rgba(15, 23, 42, 0.6)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
                            <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>DECODED METADATA:</strong>
                            <pre style={{ fontSize: '0.8rem', overflowX: 'auto', whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>
                                {JSON.stringify(decodedToken, null, 2)}
                            </pre>
                            <div className="alert alert-success" style={{ marginTop: '1.5rem', marginBottom: 0 }}>
                                ✅ Document Verified: Authenticity & Integrity Confirmed
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
