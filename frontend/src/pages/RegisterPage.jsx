import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('customer');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);
        try {
            const payload = { email, password, fullName, role };
            if (role === 'seller') {
                payload.phoneNumber = phoneNumber;
                payload.address = address;
            }
            const response = await api.post('/auth/register', payload);
            setSuccess(response.data.message + " You can now log in.");
            setEmail('');
            setPassword('');
            setFullName('');
            setRole('customer');
            setPhoneNumber('');
            setAddress('');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-card-logo">
                    Marefia Properties
                    <small>Join the Portfolio</small>
                </div>

                <h2>Create an Account</h2>
                <p className="auth-subtitle">Register to discover or list exclusive properties</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phoneNumber">Phone Number</label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="address">Private Address</label>
                        <input
                            type="text"
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="e.g. 123 Main St, Apt 4B, Beverly Hills, CA"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role">Account Type</label>
                        <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="customer">Buyer / Renter</option>
                            <option value="seller">Seller / Broker</option>
                        </select>
                    </div>

                    {error && <p className="alert alert-danger">{error}</p>}
                    {success && <p className="alert alert-success">{success}</p>}

                    <button type="submit" className="btn-gold" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                        {loading ? 'Registering...' : 'Register Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account?&nbsp;
                    <Link to="/login">Sign In</Link>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;