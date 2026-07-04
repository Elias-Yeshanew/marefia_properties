import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AuthContext from '../context/AuthContext';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            login(response.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="auth-card-logo">
                    Marefia Properties
                    <small>Member Access</small>
                </div>

                <h2>Welcome Back</h2>
                <p className="auth-subtitle">Sign in to access your account</p>

                <form onSubmit={handleSubmit}>
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

                    {error && <p className="alert alert-danger">{error}</p>}

                    <button type="submit" className="btn-gold" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                        {loading ? 'Signing In…' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account?&nbsp;
                    <Link to="/register">Create one</Link>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;