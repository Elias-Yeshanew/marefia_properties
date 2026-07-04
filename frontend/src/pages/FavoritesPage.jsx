import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function FavoritesPage() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const response = await api.get('/listings/favorites/my');
            setListings(response.data);
        } catch (err) {
            setError('Unable to load your favorites. Please ensure you are signed in.');
            console.error('Error fetching favorites:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchFavorites();
    }, []);

    const getListingImageUrl = (listing) => {
        if (listing.images && listing.images.length > 0) {
            const firstImage = listing.images[0];
            if (typeof firstImage === 'string') return firstImage;
        }
        if (listing.type === 'house') {
            return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
        }
        return 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80';
    };

    return (
        <div>
            {/* ── PAGE HEADER ── */}
            <div style={{ marginBottom: '40px' }}>
                <span className="section-label">Your Saved Collection</span>
                <span className="gold-line"></span>
                <h1 style={{ color: 'var(--white)', fontSize: 'clamp(2rem, 4vw, 3rem)', margin: '12px 0 8px 0', fontStyle: 'italic' }}>
                    My Favorites
                </h1>
                <p style={{ color: 'var(--text-muted)', maxWidth: '520px' }}>
                    Browse listings you've favorited for quick access and tracking.
                </p>
            </div>

            {/* ── LISTINGS GRID ── */}
            {loading ? (
                <div className="loading-screen" style={{ minHeight: '300px' }}>
                    <div className="spinner"></div>
                    <p className="loading-text">Loading favorites...</p>
                </div>
            ) : error ? (
                <p className="alert alert-danger">{error}</p>
            ) : listings.length === 0 ? (
                <div className="empty-state" style={{ padding: '60px 24px' }}>
                    <div className="empty-icon">❤️</div>
                    <h3>Your favorites list is empty</h3>
                    <p>Click the heart icon on any property or vehicle detail page to add it to your favorites list.</p>
                    <Link to="/listings" className="btn-gold" style={{ marginTop: '20px', display: 'inline-block', textDecoration: 'none' }}>
                        Browse All Listings
                    </Link>
                </div>
            ) : (
                <div className="listings-grid" style={{ marginTop: 0 }}>
                    {listings.map((listing) => (
                        <Link key={listing.id} to={`/listing/${listing.id}`} className="listing-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <img
                                src={getListingImageUrl(listing)}
                                alt={listing.title}
                                className="listing-image"
                                onError={(e) => {
                                    e.target.src = listing.type === 'house'
                                        ? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
                                        : 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80';
                                }}
                            />
                            <div className="listing-card-body">
                                <div className="listing-card-tag">
                                    {listing.type === 'house' ? '🏠 Property' : '🚗 Vehicle'}
                                    &nbsp;·&nbsp;
                                    {listing.category === 'for_sale' ? 'For Sale' : 'For Rent'}
                                </div>
                                <h3>{listing.title}</h3>
                                <div className="listing-price">
                                    ${parseFloat(listing.price).toLocaleString()}
                                    {listing.category === 'for_rent' && (
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/mo</span>
                                    )}
                                </div>
                                <div className="listing-meta">
                                    <span>📍 {listing.locationAddressPublic}</span>
                                    <span>👤 {listing.seller ? listing.seller.fullName : 'Marefia Representative'}</span>
                                    <span style={{ color: 'var(--gold)', marginTop: '4px' }}>👁️ {listing.views || 0} views</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FavoritesPage;
