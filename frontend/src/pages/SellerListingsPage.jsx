import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function SellerListingsPage() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMyListings = async () => {
            try {
                setLoading(true);
                const response = await api.get('/listings/my');
                setListings(response.data);
            } catch (err) {
                setError('Failed to fetch your listings. Please make sure you are logged in.');
                console.error('Error fetching seller listings:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyListings();
    }, []);

    if (loading) return (
        <div className="loading-screen">
            <div className="spinner"></div>
            <p className="loading-text">Loading Portfolio</p>
        </div>
    );

    if (error) return <p className="alert alert-danger">{error}</p>;

    return (
        <div>
            <div className="page-header">
                <span className="section-label">Your Portfolio</span>
                <span className="gold-line"></span>
                <h2>Manage Listings</h2>
                <p>View and track the status of your submitted properties and vehicles.</p>
            </div>

            {listings.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>No Listings Found</h3>
                    <p>You haven't added any properties to your portfolio yet.</p>
                    <Link to="/seller/create-listing" className="btn-gold" style={{ marginTop: '20px' }}>
                        Create First Listing
                    </Link>
                </div>
            ) : (
                <div className="listings-grid">
                    {listings.map((listing) => (
                        <div key={listing.id} className="listing-card">
                            {listing.images && listing.images.length > 0 ? (
                                <img
                                    src={listing.images[0]}
                                    alt={listing.title}
                                    className="listing-image"
                                />
                            ) : (
                                <div className="listing-image-placeholder">
                                    {listing.type === 'house' ? '🏠' : '🚗'}
                                </div>
                            )}
                            <div className="listing-card-body">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <span className={`status-badge status-${listing.status.toLowerCase()}`}>
                                        {listing.status}
                                    </span>
                                    <span className="listing-card-tag" style={{ margin: 0 }}>
                                        {listing.type === 'house' ? '🏠' : '🚗'}
                                    </span>
                                </div>
                                
                                <h3>
                                    <Link to={`/listing/${listing.id}`}>{listing.title}</Link>
                                </h3>
                                
                                <div className="listing-price" style={{ fontSize: '1.2rem' }}>
                                    ${parseFloat(listing.price).toLocaleString()}
                                </div>
                                
                                <div className="listing-meta">
                                    <span>📍 {listing.locationAddressPublic}</span>
                                    <span>📅 {new Date(listing.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SellerListingsPage;