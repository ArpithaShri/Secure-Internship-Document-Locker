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
        formData.append('uploadedBy', user._id);

        try {
            await api.post('/docs/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessage('Document uploaded successfully!');
            setUploadData({ title: '', docType: 'resume' });
            setFile(null);
            fetchDocuments();
        } catch (err) {
            setMessage('Upload failed');
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Dashboard</h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span className={`status-badge role-${user.role}`}>{user.role}</span>
                    <button onClick={logout} className="btn btn-secondary">Logout</button>
                    {user.role === 'admin' && <button onClick={() => navigate('/admin')} className="btn">Admin Panel</button>}
                </div>
            </div>

            {user.role === 'student' && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3>Upload New Document</h3>
                    {message && <p style={{ color: message.includes('success') ? 'green' : 'red' }}>{message}</p>}
                    <form onSubmit={handleFileUpload} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Title</label>
                            <input type="text" value={uploadData.title} onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })} required />
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
                        <button type="submit" className="btn">Upload</button>
                    </form>
                </div>
            )}

            <div className="card">
                <h3>Documents</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Uploaded By</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.length > 0 ? documents.map((doc) => (
                            <tr key={doc._id}>
                                <td>{doc.title}</td>
                                <td>{doc.docType}</td>
                                <td>{doc.uploadedBy?.username || 'Unknown'}</td>
                                <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <a href={`http://localhost:5000/${doc.filePath}`} target="_blank" rel="noopener noreferrer" className="btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>View</a>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center' }}>No documents found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
