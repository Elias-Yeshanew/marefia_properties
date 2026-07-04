import { useState, useEffect } from 'react';
import api from '../services/api';

function AdminListingsPage() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedListing, setSelectedListing] = useState(null);
    const [statusUpdateMessage, setStatusUpdateMessage] = useState(null);
    const [statusUpdateError, setStatusUpdateError] = useState(null);

    const fetchAllListings = async () => {
        try {
            setLoading(true);
            const allListingsResponse = await api.get('/listings/admin/all-listings');
            setListings(allListingsResponse.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch listings for admin. Are you logged in as admin/broker?');
            setLoading(false);
            console.error('Error fetching admin listings:', err);
        }
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { fetchAllListings(); }, []);

    const handleViewDetails = async (listingId) => {
        try {
            setStatusUpdateMessage(null);
            setStatusUpdateError(null);
            const response = await api.get(`/listings/admin/${listingId}`);
            setSelectedListing(response.data);
            
            // Scroll down to details
            setTimeout(() => {
                document.getElementById('admin-detail-view')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (err) {
            alert('Failed to fetch listing details: ' + (err.response?.data?.message || err.message));
            console.error('Error fetching admin listing details:', err);
        }
    };

    const handleUpdateStatus = async (listingId, newStatus) => {
        try {
            setStatusUpdateMessage(null);
            setStatusUpdateError(null);
            const response = await api.put(`/listings/admin/${listingId}/status`, { status: newStatus });
            setStatusUpdateMessage(response.data.message);
            setSelectedListing((prev) => ({ ...prev, status: newStatus }));
            fetchAllListings();
        } catch (err) {
            setStatusUpdateError(err.response?.data?.message || 'Failed to update status.');
            console.error('Error updating status:', err);
        }
    };

    if (loading) return (
        <div className="loading-screen">
            <div className="spinner"></div>
            <p className="loading-text">Loading Dashboard</p>
        </div>
    );

    if (error) return <p className="alert alert-danger">{error}</p>;

    return (
        <div>
            <div className="page-header">
                <span className="section-label">Broker Dashboard</span>
                <span className="gold-line"></span>
                <h2>Listing Management</h2>
                <p>Review pending submissions, manage active portfolio, and view client details.</p>
            </div>

            {statusUpdateMessage && <p className="alert alert-success">{statusUpdateMessage}</p>}
            {statusUpdateError && <p className="alert alert-danger">{statusUpdateError}</p>}

            {listings.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🗄️</div>
                    <h3>System is Empty</h3>
                    <p>No properties have been submitted to the platform yet.</p>
                </div>
            ) : (
                <div className="admin-grid">
                    {listings.map((listing) => (
                        <div key={listing.id} className="admin-listing-row">
                            <span className={`status-badge status-${listing.status.toLowerCase()}`}>
                                {listing.status}
                            </span>
                            <div className="row-title">
                                {listing.title}
                                <div className="row-date">
                                    {listing.type === 'house' ? '🏠' : '🚗'} • Added {new Date(listing.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="row-actions">
                                <button className="btn-outline" onClick={() => handleViewDetails(listing.id)}>
                                    Review
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedListing && (
                <div id="admin-detail-view" className="detail-panel">
                    <h3>Review: {selectedListing.title}</h3>
                    
                    <div className="detail-dl">
                        <div>
                            <dt>Listing ID</dt>
                            <dd>{selectedListing.id}</dd>
                        </div>
                        <div>
                            <dt>Current Status</dt>
                            <dd>
                                <span className={`status-badge status-${selectedListing.status.toLowerCase()}`} style={{ marginTop: '4px' }}>
                                    {selectedListing.status}
                                </span>
                            </dd>
                        </div>
                        <div>
                            <dt>Property Type</dt>
                            <dd style={{ textTransform: 'capitalize' }}>{selectedListing.type}</dd>
                        </div>
                        <div>
                            <dt>Category</dt>
                            <dd style={{ textTransform: 'capitalize' }}>{selectedListing.category.replace('_', ' ')}</dd>
                        </div>
                        <div>
                            <dt>Price</dt>
                            <dd className="listing-price" style={{ margin: '4px 0 0', fontSize: '1.2rem' }}>
                                ${parseFloat(selectedListing.price).toLocaleString()}
                            </dd>
                        </div>
                        <div>
                            <dt>Public Location</dt>
                            <dd>{selectedListing.locationAddressPublic}</dd>
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: '28px' }}>
                        <dt style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Description</dt>
                        <dd style={{ fontSize: '0.92rem', color: 'var(--text-light)', lineHeight: '1.6' }}>{selectedListing.description}</dd>
                    </div>

                    {selectedListing.images && selectedListing.images.length > 0 && (
                        <div style={{ marginBottom: '28px' }}>
                            <dt style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Media Assets</dt>
                            <div className="image-preview-grid">
                                {selectedListing.images.map((img, index) => (
                                    <a key={index} href={img} target="_blank" rel="noreferrer">
                                        <img src={img} alt={`Listing ${index}`} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pii-section">
                        <h4>Client Confidential Info</h4>
                        <div className="detail-dl" style={{ marginBottom: 0 }}>
                            <div>
                                <dt>Seller Name</dt>
                                <dd>{selectedListing.seller?.fullName}</dd>
                            </div>
                            <div>
                                <dt>Email Address</dt>
                                <dd>{selectedListing.seller?.email}</dd>
                            </div>
                            <div>
                                <dt>Phone Number</dt>
                                <dd>{selectedListing.seller?.phoneNumber || 'Not provided'}</dd>
                            </div>
                            <div>
                                <dt>Private Address</dt>
                                <dd>{selectedListing.seller?.address || 'Not provided'}</dd>
                            </div>
                        </div>
                    </div>

                    <div className="action-row">
                        {selectedListing.status !== 'approved' && (
                            <button className="btn-gold" onClick={() => handleUpdateStatus(selectedListing.id, 'approved')}>
                                Approve Listing
                            </button>
                        )}
                        {selectedListing.status !== 'rejected' && (
                            <button className="btn-outline" onClick={() => handleUpdateStatus(selectedListing.id, 'rejected')} style={{ borderColor: '#f87171', color: '#f87171' }}>
                                Reject
                            </button>
                        )}
                        {selectedListing.status !== 'sold' && (
                            <button className="btn-ghost" onClick={() => handleUpdateStatus(selectedListing.id, 'sold')}>
                                Mark as Sold/Rented
                            </button>
                        )}
                        <button className="btn-ghost" style={{ marginLeft: 'auto' }} onClick={() => {
                            setSelectedListing(null);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}>
                            Close Review
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminListingsPage;