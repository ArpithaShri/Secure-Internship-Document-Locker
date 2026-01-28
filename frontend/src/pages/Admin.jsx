import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser || storedUser.role !== 'admin') {
            navigate('/dashboard');
            return;
        }

        const fetchData = async () => {
            try {
                const [usersRes, docsRes] = await Promise.all([
                    api.get('/admin/users'),
                    api.get('/admin/docs')
                ]);
                setUsers(usersRes.data);
                setDocuments(docsRes.data);
            } catch (err) {
                console.error('Failed to fetch admin data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    if (loading) return <div className="container">Loading...</div>;

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Admin Panel</h1>
                <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">Back to Dashboard</button>
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
                <h3>All Documents</h3>
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
