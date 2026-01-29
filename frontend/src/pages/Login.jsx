import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', formData);
            if (res.data.message === 'OTP sent') {
                localStorage.setItem('temp_userId', res.data.userId);
                navigate('/verify-otp');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '480px', marginTop: '10vh' }}>
            <div className="card" style={{ padding: '3.5rem 2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{ fontSize: '2rem' }}>Secure Login</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Enter your credentials to access the vault</p>
                </div>

                {error && (
                    <div className="alert alert-error" style={{ fontSize: '0.9rem', padding: '0.75rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Institutional Email</label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            required
                            placeholder="name@university.edu"
                        />
                    </div>
                    <div className="form-group">
                        <label>Secure Password</label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="btn" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner"></span> Authenticating...
                            </>
                        ) : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                    New to the platform? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Create an Account</Link>
                </p>
            </div>

            <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                &copy; 2026 Secure Internship Document Locker. All rights reserved.
            </p>
        </div>
    );
};

export default Login;
