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
                // Store userId temporarily for OTP verification
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
        <div className="container" style={{ maxWidth: '500px' }}>
            <div className="card">
                <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Welcome Back</h1>
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" value={email} onChange={onChange} required placeholder="Enter email" />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" value={password} onChange={onChange} required placeholder="Enter password" />
                    </div>
                    <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Processing...' : 'Login'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
