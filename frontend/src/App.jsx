import { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreateListingPage from './pages/CreateListingPage';
import SellerListingsPage from './pages/SellerListingsPage';
import AdminListingsPage from './pages/AdminListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import AllListingsPage from './pages/AllListingsPage';
import FavoritesPage from './pages/FavoritesPage';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import AuthContext from './context/AuthContext';
import './App.css';

function App() {
  const parseToken = (jwt) => {
    if (!jwt) return null;
    try {
      return JSON.parse(atob(jwt.split('.')[1]));
    } catch {
      return null;
    }
  };

  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => parseToken(localStorage.getItem('token')));
  const navigate = useNavigate();

  const login = (jwtToken) => {
    localStorage.setItem('token', jwtToken);
    setToken(jwtToken);
    setUser(parseToken(jwtToken));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      <div className="App">

        {/* ── Navbar ── */}
        <nav className="navbar">
          <Link to="/" className="nav-brand">
            Marefia<span className="brand-accent">&nbsp;Properties</span>
          </Link>

          <div className="nav-links">
            {!user ? (
              <>
                <Link to="/" className="nav-item">Home</Link>
                <Link to="/listings" className="nav-item">Browse All</Link>
                <Link to="/login" className="nav-item">Sign In</Link>
                <Link to="/register" className="nav-item" style={{ color: 'var(--gold)' }}>Register</Link>
              </>
            ) : (
              <>
                <Link to="/" className="nav-item">Home</Link>
                <Link to="/listings" className="nav-item">Browse All</Link>
                <Link to="/favorites" className="nav-item">My Favorites</Link>
                {user.role === 'seller' && (
                  <>
                    <Link to="/seller/create-listing" className="nav-item">+ New Listing</Link>
                    <Link to="/seller/my-listings" className="nav-item">My Listings</Link>
                  </>
                )}
                {(user.role === 'admin' || user.role === 'broker') && (
                  <Link to="/admin/listings" className="nav-item">Dashboard</Link>
                )}
                <span className="nav-welcome">Welcome, <strong>{user.email?.split('@')[0]}</strong></span>
                <button onClick={logout} className="nav-button">Sign Out</button>
              </>
            )}
          </div>
        </nav>

        {/* ── Routes ── */}
        <div className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/listings" element={<AllListingsPage />} />
            <Route path="/favorites" element={<PrivateRoute><FavoritesPage /></PrivateRoute>} />
            <Route path="/listing/:id" element={<ListingDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/seller/create-listing" element={
              <PrivateRoute requiredRole="seller"><CreateListingPage /></PrivateRoute>
            } />
            <Route path="/seller/my-listings" element={
              <PrivateRoute requiredRole="seller"><SellerListingsPage /></PrivateRoute>
            } />
            <Route path="/admin/listings" element={
              <AdminRoute><AdminListingsPage /></AdminRoute>
            } />
          </Routes>
        </div>

        {/* ── Footer ── */}
        <footer className="site-footer">
          <span className="footer-brand">Marefia Properties</span>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </footer>

      </div>
    </AuthContext.Provider>
  );
}

export default App;