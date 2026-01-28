import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const OTP = () => {
    const [otpCode, setOtpCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const id = localStorage.getItem('temp_userId');
        if (!id) {
            navigate('/login');
        } else {
            setUserId(id);
        }
    }, [navigate]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/verify-otp', { userId, otpCode });
            localStorage.setItem('user', JSON.stringify(res.data));
            localStorage.removeItem('temp_userId');
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '500px' }}>
            <div className="card">
                <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Enter OTP</h1>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    A 6-digit code has been "sent" to your email. (Check backend console for simulation)
                </p>
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>One-Time Password</label>
                        <input
                            type="text"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            required
                            placeholder="6-digit OTP"
                            maxLength="6"
                            style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                        />
                    </div>
                    <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify & Login'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    Wait! I didn't get it. <button onClick={() => navigate('/login')} className="btn-secondary" style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}>Go Back</button>
                </p>
            </div>
        </div>
    );
};

export default OTP;
