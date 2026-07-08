import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingScreen from '../components/LoadingScreen';
import EmptyState from '../components/EmptyState';

function AdminListingsPage() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedListing, setSelectedListing] = useState(null);
    const [statusUpdateMessage, setStatusUpdateMessage] = useState(null);
    const [statusUpdateError, setStatusUpdateError] = useState(null);
    const [activeTab, setActiveTab] = useState('listings');
    const [inquiries, setInquiries] = useState([]);
    const [inquiriesLoading, setInquiriesLoading] = useState(false);
    const [inquiryFilter, setInquiryFilter] = useState('all');

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

    const fetchInquiries = async () => {
        try {
            setInquiriesLoading(true);
            const res = await api.get('/inquiries/admin');
            setInquiries(res.data);
        } catch (err) {
            console.error('Error fetching inquiries:', err);
        } finally {
            setInquiriesLoading(false);
        }
    };

    useEffect(() => { fetchAllListings(); fetchInquiries(); }, []);

    const handleViewDetails = async (listingId) => {
        try {
            setStatusUpdateMessage(null);
            setStatusUpdateError(null);
            const response = await api.get(`/listings/admin/${listingId}`);
            setSelectedListing(response.data);
            setTimeout(() => {
                document.getElementById('admin-detail-view')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (err) {
            alert('Failed to fetch listing details: ' + (err.response?.data?.message || err.message));
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
        }
    };

    const handleUpdateInquiryStatus = async (inquiryId, status) => {
        try {
            await api.put(`/inquiries/admin/${inquiryId}/status`, { status });
            setInquiries((prev) => prev.map((inq) =>
                inq.id === inquiryId ? { ...inq, status } : inq
            ));
        } catch (err) {
            console.error('Error updating inquiry status:', err);
        }
    };

    if (loading) return <LoadingScreen text="Loading Dashboard" />;
    if (error) return <p className="alert alert-danger">{error}</p>;

    const newInquiryCount = inquiries.filter(i => i.status === 'new').length;

    return (
        <div>
            <div className="page-header">
                <span className="section-label">Broker Dashboard</span>
                <span className="gold-line"></span>
                <h2>Listing Management</h2>
                <p>Review pending submissions, manage active portfolio, and view client inquiries.</p>
            </div>

            <div className="modal-tabs" style={{ marginBottom: '32px', maxWidth: '440px' }}>
                <button
                    className={`modal-tab ${activeTab === 'listings' ? 'modal-tab-active' : ''}`}
                    onClick={() => setActiveTab('listings')}
                >
                    ?? Listings
                </button>
                <button
                    className={`modal-tab ${activeTab === 'inquiries' ? 'modal-tab-active' : ''}`}
                    onClick={() => { setActiveTab('inquiries'); fetchInquiries(); }}
                    style={{ position: 'relative' }}
                >
                    ?? Inquiries
                    {newInquiryCount > 0 && (
                        <span style={{
                            position: 'absolute', top: '6px', right: '8px',
                            background: '#ef4444', color: '#fff',
                            borderRadius: '50%', width: '16px', height: '16px',
                            fontSize: '0.6rem', fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            {newInquiryCount}
                        </span>
                    )}
                </button>
            </div>

            {activeTab === 'listings' && (
                <div>
                    {statusUpdateMessage && <p className="alert alert-success">{statusUpdateMessage}</p>}
                    {statusUpdateError && <p className="alert alert-danger">{statusUpdateError}</p>}
                    {listings.length === 0 ? (
                        <EmptyState icon="???" title="System is Empty" description="No properties have been submitted to the platform yet." />
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
                                            {listing.type === 'house' ? '??' : '??'} • Added {new Date(listing.createdAt).toLocaleDateString()}
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
                                <div><dt>Listing ID</dt><dd>{selectedListing.id}</dd></div>
                                <div>
                                    <dt>Current Status</dt>
                                    <dd><span className={`status-badge status-${selectedListing.status.toLowerCase()}`} style={{ marginTop: '4px' }}>{selectedListing.status}</span></dd>
                                </div>
                                <div><dt>Property Type</dt><dd style={{ textTransform: 'capitalize' }}>{selectedListing.type}</dd></div>
                                <div><dt>Category</dt><dd style={{ textTransform: 'capitalize' }}>{selectedListing.category.replace('_', ' ')}</dd></div>
                                <div>
                                    <dt>Price</dt>
                                    <dd className="listing-price" style={{ margin: '4px 0 0', fontSize: '1.2rem' }}>${parseFloat(selectedListing.price).toLocaleString()}</dd>
                                </div>
                                <div><dt>Public Location</dt><dd>{selectedListing.locationAddressPublic}</dd></div>
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
                                    <div><dt>Seller Name</dt><dd>{selectedListing.seller?.fullName}</dd></div>
                                    <div><dt>Email Address</dt><dd>{selectedListing.seller?.email}</dd></div>
                                    <div><dt>Phone Number</dt><dd>{selectedListing.seller?.phoneNumber || 'Not provided'}</dd></div>
                                    <div><dt>Private Address</dt><dd>{selectedListing.seller?.address || 'Not provided'}</dd></div>
                                </div>
                            </div>
                            <div className="action-row">
                                {selectedListing.status !== 'approved' && (
                                    <button className="btn-gold" onClick={() => handleUpdateStatus(selectedListing.id, 'approved')}>Approve Listing</button>
                                )}
                                {selectedListing.status !== 'rejected' && (
                                    <button className="btn-outline" onClick={() => handleUpdateStatus(selectedListing.id, 'rejected')} style={{ borderColor: '#f87171', color: '#f87171' }}>Reject</button>
                                )}
                                {selectedListing.status !== 'sold' && (
                                    <button className="btn-ghost" onClick={() => handleUpdateStatus(selectedListing.id, 'sold')}>Mark as Sold/Rented</button>
                                )}
                                <Link to={`/listings/edit/${selectedListing.id}`} className="btn-ghost" style={{ borderColor: 'rgba(201,168,76,0.4)', color: 'var(--gold)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    ?? Edit Listing
                                </Link>
                                <button className="btn-ghost" style={{ marginLeft: 'auto' }} onClick={() => { setSelectedListing(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                                    Close Review
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'inquiries' && (
                <div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'center' }}>
                        {[
                            { key: 'all', label: 'All' },
                            { key: 'new', label: '?? New' },
                            { key: 'inquiry', label: '?? Inquiries' },
                            { key: 'viewing', label: '?? Viewings' },
                            { key: 'read', label: 'Read' },
                            { key: 'responded', label: '? Responded' },
                        ].map(({ key, label }) => (
                            <button key={key} className={inquiryFilter === key ? 'btn-gold' : 'btn-ghost'} style={{ padding: '7px 16px', fontSize: '0.75rem', height: 'auto' }} onClick={() => setInquiryFilter(key)}>
                                {label}
                            </button>
                        ))}
                        <button className="btn-ghost" style={{ padding: '7px 16px', fontSize: '0.75rem', height: 'auto', marginLeft: 'auto' }} onClick={fetchInquiries}>? Refresh</button>
                    </div>

                    {inquiriesLoading ? (
                        <LoadingScreen text="Loading inquiries…" />
                    ) : inquiries.length === 0 ? (
                        <EmptyState icon="??" title="No Inquiries Yet" description="Inquiries and viewing requests from visitors will appear here." />
                    ) : (() => {
                        const filtered = inquiries.filter((inq) => {
                            if (inquiryFilter === 'all') return true;
                            if (inquiryFilter === 'new') return inq.status === 'new';
                            if (inquiryFilter === 'read') return inq.status === 'read';
                            if (inquiryFilter === 'responded') return inq.status === 'responded';
                            if (inquiryFilter === 'inquiry') return inq.type === 'inquiry';
                            if (inquiryFilter === 'viewing') return inq.type === 'viewing';
                            return true;
                        });
                        if (filtered.length === 0) return <EmptyState icon="??" title="No matches" description="No inquiries match this filter." />;
                        return (
                            <div>
                                {filtered.map((inq) => (
                                    <div key={inq.id} className="inquiry-row">
                                        <div className="inquiry-row-header">
                                            <span style={{ fontWeight: 600, color: 'var(--white)', fontSize: '0.95rem' }}>{inq.name}</span>
                                            <span className={`inquiry-badge inquiry-badge-${inq.type}`}>{inq.type === 'viewing' ? '?? Viewing' : '?? Inquiry'}</span>
                                            <span className={`inquiry-badge inquiry-badge-${inq.status}`}>{inq.status}</span>
                                            <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                {new Date(inq.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="inquiry-row-meta">
                                            <span>?? {inq.email}</span>
                                            {inq.phone && <span>?? {inq.phone}</span>}
                                            {inq.listing && <span>?? {inq.listing.title}{inq.listing.locationAddressPublic && ` · ${inq.listing.locationAddressPublic}`}</span>}
                                            {inq.type === 'viewing' && inq.preferredDate && (
                                                <span style={{ color: '#a78bfa' }}>?? {inq.preferredDate}{inq.preferredTime ? ` @ ${inq.preferredTime}` : ''}</span>
                                            )}
                                        </div>
                                        {inq.message && <div className="inquiry-row-message">{inq.message}</div>}
                                        <div className="inquiry-row-actions">
                                            {inq.status !== 'read' && (
                                                <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: '0.73rem', height: 'auto' }} onClick={() => handleUpdateInquiryStatus(inq.id, 'read')}>Mark as Read</button>
                                            )}
                                            {inq.status !== 'responded' && (
                                                <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: '0.73rem', height: 'auto', borderColor: 'rgba(74,222,128,0.35)', color: '#4ade80' }} onClick={() => handleUpdateInquiryStatus(inq.id, 'responded')}>? Mark Responded</button>
                                            )}
                                            {inq.listing && (
                                                <Link to={`/listing/${inq.listing.id}`} className="btn-ghost" style={{ padding: '6px 14px', fontSize: '0.73rem', height: 'auto', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>View Listing ?</Link>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}

export default AdminListingsPage;
