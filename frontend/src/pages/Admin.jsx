import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [accessRequests, setAccessRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser || storedUser.role !== 'admin') {
            navigate('/dashboard');
            return;
        }

        fetchAdminData();
    }, [navigate]);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const [usersRes, docsRes, accessRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/docs'),
                api.get('/access/all')
            ]);
            setUsers(usersRes.data);
            setDocuments(docsRes.data);
            setAccessRequests(accessRes.data);
        } catch (err) {
            console.error('Failed to fetch admin data');
        } finally {
            setLoading(false);
        }
    };

    const handleAccessApproval = async (requestId, status) => {
        try {
            await api.post(`/access/approve/${requestId}`, { status });
            fetchAdminData();
        } catch (err) {
            alert('Action failed');
        }
    };

    const handleSignDocument = async (docId) => {
        try {
            const res = await api.post(`/admin/sign-document/${docId}`);
            alert(res.data.message);
            fetchAdminData();
        } catch (err) {
            alert('Signing failed: ' + (err.response?.data?.message || 'Error'));
        }
    };

    if (loading) return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div className="card" style={{ padding: '2rem' }}>
                <p>Initializing Administrative Secure Shell...</p>
            </div>
        </div>
    );

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem' }}>Control Center</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Administrative Oversight & Authority Dashboard</p>
                </div>
                <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
                    ← Back to Dashboard
                </button>
            </div>

            <div className="card" style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                    Critical Access Requests
                </h3>
                <table>
                    <thead>
                        <tr>
                            <th>Initiator (Recruiter)</th>
                            <th>Target (Student)</th>
                            <th>Document Title</th>
                            <th>Status</th>
                            <th>Decision</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accessRequests.filter(r => r.status === 'pending').map((req) => (
                            <tr key={req._id}>
                                <td style={{ fontWeight: '600' }}>{req.recruiterId?.username}</td>
                                <td>{req.studentId?.username}</td>
                                <td style={{ color: 'var(--primary)' }}>{req.documentId?.title}</td>
                                <td>
                                    <span className="status-badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                        {req.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button onClick={() => handleAccessApproval(req._id, 'approved')} className="btn" style={{ background: 'var(--success)', padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Authorize</button>
                                        <button onClick={() => handleAccessApproval(req._id, 'rejected')} className="btn" style={{ background: 'var(--accent)', padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Deny</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {accessRequests.filter(r => r.status === 'pending').length === 0 && (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No pending authorization requests recorded.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Registered Users</h3>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Identity</th>
                                    <th>Access Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u._id}>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{u.username}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                                        </td>
                                        <td><span className={`status-badge role-${u.role}`}>{u.role}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>System-Wide Repository</h3>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Document</th>
                                    <th>Owner</th>
                                    <th>Verification</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map((doc) => (
                                    <tr key={doc._id}>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{doc.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.docType}</div>
                                        </td>
                                        <td>{doc.uploadedBy?.username}</td>
                                        <td>
                                            {doc.verifiedByAdmin ?
                                                <span className="status-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Signed ✅</span> :
                                                <span className="status-badge" style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.2)' }}>Unsigned</span>
                                            }
                                        </td>
                                        <td>
                                            {!doc.verifiedByAdmin && (
                                                <button onClick={() => handleSignDocument(doc._id)} className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Sign Root</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
