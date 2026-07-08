import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function Navbar() {
    const { user, logout } = useContext(AuthContext);

    return (
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
                            <>
                                <Link to="/admin/listings" className="nav-item">Dashboard</Link>
                                <Link to="/admin/create-listing" className="nav-item">+ New Listing</Link>
                            </>
                        )}
                        <span className="nav-welcome">Welcome, <strong>{user.email?.split('@')[0]}</strong></span>
                        <button onClick={logout} className="nav-button">Sign Out</button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
