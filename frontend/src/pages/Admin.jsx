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

    if (loading) return <div className="container">Loading...</div>;

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Admin Panel (Phase 2 Authorization)</h1>
                <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">Back to Dashboard</button>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3>Pending Access Requests</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Recruiter</th>
                            <th>Student</th>
                            <th>Document</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accessRequests.filter(r => r.status === 'pending').map((req) => (
                            <tr key={req._id}>
                                <td>{req.recruiterId?.username}</td>
                                <td>{req.studentId?.username}</td>
                                <td>{req.documentId?.title}</td>
                                <td><span className="status-badge" style={{ backgroundColor: '#fef9c3', color: '#854d0e' }}>{req.status}</span></td>
                                <td>
                                    <button onClick={() => handleAccessApproval(req._id, 'approved')} className="btn" style={{ background: '#22c55e', marginRight: '0.5rem', padding: '0.25rem 0.75rem' }}>Approve</button>
                                    <button onClick={() => handleAccessApproval(req._id, 'rejected')} className="btn" style={{ background: '#ef4444', padding: '0.25rem 0.75rem' }}>Reject</button>
                                </td>
                            </tr>
                        ))}
                        {accessRequests.filter(r => r.status === 'pending').length === 0 && (
                            <tr><td colSpan="5" style={{ textAlign: 'center' }}>No pending requests</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3>All Users</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u._id}>
                                <td>{u.username}</td>
                                <td>{u.email}</td>
                                <td><span className={`status-badge role-${u.role}`}>{u.role}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card">
                <h3>All Documents (Global Admin View)</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Uploaded By</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map((doc) => (
                            <tr key={doc._id}>
                                <td>{doc.title}</td>
                                <td>{doc.docType}</td>
                                <td>{doc.uploadedBy?.username}</td>
                                <td><span className={`status-badge role-${doc.uploadedBy?.role}`}>{doc.uploadedBy?.role}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Admin;
