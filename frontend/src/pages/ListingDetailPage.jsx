import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import ListingGallery from '../components/ListingGallery';
import ListingSidebar from '../components/ListingSidebar';
import LoadingScreen from '../components/LoadingScreen';
import EmptyState from '../components/EmptyState';

function ListingDetailPage() {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const showListedBy = user && (user.role === 'admin' || user.role === 'broker');
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchListing = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/listings/approved/${id}`);
                setListing(response.data);
                window.scrollTo(0, 0);
            } catch (err) {
                setError('Property not found or is no longer available.');
                console.error('Error fetching listing:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchListing();
    }, [id]);

    const handleToggleFavorite = async () => {
        try {
            const response = await api.post(`/listings/favorite/${id}`);
            setListing(prev => ({
                ...prev,
                isFavorited: response.data.favorited
            }));
        } catch (err) {
            console.error('Error toggling favorite:', err);
            alert('Failed to update favorite status.');
        }
    };

    if (loading) return <LoadingScreen text="Loading Details" />;

    if (error) return (
        <EmptyState
            icon="🔐"
            title="Not Available"
            description={error}
            action={
                <Link to="/listings" className="btn-gold" style={{ marginTop: '20px', display: 'inline-block', textDecoration: 'none' }}>
                    Browse Listings
                </Link>
            }
        />
    );

    if (!listing) return null;

    return (
        <div>
            {/* ── BREADCRUMB ── */}
            <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
                <span style={{ color: 'var(--text-muted)' }}>›</span>
                <Link to="/listings" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Listings</Link>
                <span style={{ color: 'var(--text-muted)' }}>›</span>
                <span style={{ color: 'var(--gold)' }}>{listing.title}</span>
            </div>

            {/* ── TITLE ROW ── */}
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className="listing-card-tag" style={{ margin: 0 }}>
                            {listing.type === 'house' ? '🏠 Property' : '🚗 Vehicle'}
                        </span>
                        <span className="listing-card-tag" style={{ margin: 0, color: listing.category === 'for_sale' ? 'var(--gold)' : '#7dd3fc' }}>
                            {listing.category === 'for_sale' ? 'For Sale' : 'For Rent'}
                        </span>
                        <span className="listing-card-tag" style={{ margin: 0, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', textTransform: 'lowercase' }}>
                            👁️ {listing.views || 0} views
                        </span>
                    </div>
                    <h1 style={{ color: 'var(--white)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontStyle: 'italic', margin: '0 0 8px 0' }}>
                        {listing.title}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        📍 {listing.locationAddressPublic}
                    </p>
                </div>

                {/* Edit listing: only for owner or admin */}
                {user && (user.role === 'admin' || user.id === listing.sellerId) && (
                    <Link
                        to={`/listings/edit/${listing.id}`}
                        style={{
                            background: 'rgba(201,168,76,0.12)',
                            border: '1px solid rgba(201,168,76,0.4)',
                            borderRadius: '50%',
                            width: '48px',
                            height: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            color: 'var(--gold)',
                            transition: 'all 0.2s ease',
                            textDecoration: 'none',
                            boxShadow: 'var(--shadow-deep)',
                        }}
                        title="Edit Listing"
                    >
                        ✏️
                    </Link>
                )}

                {user && (
                    <button
                        onClick={handleToggleFavorite}
                        style={{
                            background: listing.isFavorited ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                            border: `1px solid ${listing.isFavorited ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '50%',
                            width: '48px',
                            height: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '1.4rem',
                            color: listing.isFavorited ? '#ef4444' : 'var(--text-muted)',
                            transition: 'all 0.2s ease',
                            padding: 0,
                            boxShadow: 'var(--shadow-deep)'
                        }}
                        title={listing.isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
                    >
                        {listing.isFavorited ? '❤️' : '🤍'}
                    </button>
                )}
            </div>

            {/* ── MAIN LAYOUT ── */}
            <div className="detail-grid">

                {/* ── LEFT: GALLERY + DESCRIPTION ── */}
                <div className="detail-main">
                    <ListingGallery images={listing.images} type={listing.type} title={listing.title} />

                    {/* DESCRIPTION */}
                    <div style={{ marginTop: '48px' }}>
                        <span className="section-label">
                            {listing.type === 'house' ? 'Property Overview' : 'Vehicle Overview'}
                        </span>
                        <span className="gold-line"></span>
                        <div style={{ color: 'var(--text-light)', lineHeight: '1.9', fontSize: '1.05rem', whiteSpace: 'pre-wrap', marginTop: '16px' }}>
                            {listing.description}
                        </div>
                    </div>

                    {/* DETAIL FACTS */}
                    <div style={{ marginTop: '48px' }}>
                        <span className="section-label">Key Details</span>
                        <span className="gold-line"></span>
                        <div className="detail-facts-grid">
                            <div className="detail-fact">
                                <span className="fact-icon">{listing.type === 'house' ? '🏠' : '🚗'}</span>
                                <span className="fact-label">Type</span>
                                <span className="fact-value" style={{ textTransform: 'capitalize' }}>{listing.type}</span>
                            </div>
                            <div className="detail-fact">
                                <span className="fact-icon">📋</span>
                                <span className="fact-label">Category</span>
                                <span className="fact-value">{listing.category === 'for_sale' ? 'For Sale' : 'For Rent'}</span>
                            </div>
                            <div className="detail-fact">
                                <span className="fact-icon">📍</span>
                                <span className="fact-label">Location</span>
                                <span className="fact-value">{listing.locationAddressPublic}</span>
                            </div>
                            {showListedBy && (
                                <div className="detail-fact">
                                    <span className="fact-icon">👤</span>
                                    <span className="fact-label">Listed By</span>
                                    <span className="fact-value">{listing.seller ? listing.seller.fullName : 'Marefia Properties'}</span>
                                </div>
                            )}
                            {listing.createdAt && (
                                <div className="detail-fact">
                                    <span className="fact-icon">📅</span>
                                    <span className="fact-label">Listed On</span>
                                    <span className="fact-value">{new Date(listing.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                            )}
                            <div className="detail-fact">
                                <span className="fact-icon">🖼️</span>
                                <span className="fact-label">Photos</span>
                                <span className="fact-value">{(listing.images || []).length} image{(listing.images || []).length !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="detail-fact">
                                <span className="fact-icon">👁️</span>
                                <span className="fact-label">Views</span>
                                <span className="fact-value">{listing.views || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: STICKY SIDEBAR ── */}
                <ListingSidebar listing={listing} />
            </div>
        </div>
    );
}

export default ListingDetailPage;