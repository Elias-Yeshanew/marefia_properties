import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import AuthContext from '../context/AuthContext';

function ListingDetailPage() {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImage, setActiveImage] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    useEffect(() => {
        const fetchListing = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/listings/approved/${id}`);
                setListing(response.data);
                setActiveImage(0);
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

    const fallbackImage = (type) =>
        type === 'house'
            ? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
            : 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80';

    const images = (listing && listing.images && listing.images.length > 0)
        ? listing.images
        : [fallbackImage(listing?.type)];

    // Keyboard navigation for lightbox
    useEffect(() => {
        if (!lightboxOpen) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') setLightboxOpen(false);
            if (e.key === 'ArrowRight') setActiveImage(i => (i + 1) % images.length);
            if (e.key === 'ArrowLeft') setActiveImage(i => (i - 1 + images.length) % images.length);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [lightboxOpen, images.length]);

    if (loading) return (
        <div className="loading-screen">
            <div className="spinner"></div>
            <p className="loading-text">Loading Details</p>
        </div>
    );

    if (error) return (
        <div className="empty-state">
            <div className="empty-icon">🔐</div>
            <h3>Not Available</h3>
            <p>{error}</p>
            <Link to="/listings" className="btn-gold" style={{ marginTop: '20px', display: 'inline-block', textDecoration: 'none' }}>
                Browse Listings
            </Link>
        </div>
    );

    if (!listing) return null;

    const prevImage = () => setActiveImage(i => (i - 1 + images.length) % images.length);
    const nextImage = () => setActiveImage(i => (i + 1) % images.length);

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

                    {/* MAIN IMAGE */}
                    <div className="gallery-main-wrapper" onClick={() => setLightboxOpen(true)}>
                        <img
                            src={images[activeImage]}
                            alt={`${listing.title} — view ${activeImage + 1}`}
                            className="gallery-main-img"
                            onError={(e) => { e.target.src = fallbackImage(listing.type); }}
                        />
                        {images.length > 1 && (
                            <>
                                <button className="gallery-arrow gallery-arrow-left" onClick={(e) => { e.stopPropagation(); prevImage(); }} aria-label="Previous">‹</button>
                                <button className="gallery-arrow gallery-arrow-right" onClick={(e) => { e.stopPropagation(); nextImage(); }} aria-label="Next">›</button>
                                <div className="gallery-count">{activeImage + 1} / {images.length}</div>
                            </>
                        )}
                        <div className="gallery-zoom-hint">🔍 Click to enlarge</div>
                    </div>

                    {/* THUMBNAILS */}
                    {images.length > 1 && (
                        <div className="gallery-thumbs">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    className={`gallery-thumb${idx === activeImage ? ' gallery-thumb-active' : ''}`}
                                    onClick={() => setActiveImage(idx)}
                                    aria-label={`View image ${idx + 1}`}
                                >
                                    <img
                                        src={img}
                                        alt={`Thumbnail ${idx + 1}`}
                                        onError={(e) => { e.target.src = fallbackImage(listing.type); }}
                                    />
                                </button>
                            ))}
                        </div>
                    )}

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
                            <div className="detail-fact">
                                <span className="fact-icon">👤</span>
                                <span className="fact-label">Listed By</span>
                                <span className="fact-value">{listing.seller ? listing.seller.fullName : 'Marefia Properties'}</span>
                            </div>
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
                                <span className="fact-value">{images.length} image{images.length !== 1 ? 's' : ''}</span>
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
                <div className="detail-sidebar-wrapper">
                    <div className="detail-sidebar">

                        {/* PRICE */}
                        <div style={{ marginBottom: '28px', paddingBottom: '28px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                                {listing.category === 'for_sale' ? 'Asking Price' : 'Monthly Rate'}
                            </span>
                            <span className="listing-price" style={{ fontSize: '2.2rem', display: 'block', margin: 0 }}>
                                ${parseFloat(listing.price).toLocaleString()}
                                {listing.category === 'for_rent' && (
                                    <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}> / mo</span>
                                )}
                            </span>
                        </div>

                        {/* QUICK FACTS */}
                        <div className="detail-info" style={{ margin: '0 0 28px 0' }}>
                            <dl>
                                <div>
                                    <dt>Category</dt>
                                    <dd>{listing.category === 'for_sale' ? 'Acquisition' : 'Leasing'}</dd>
                                </div>
                                <div>
                                    <dt>Asset Class</dt>
                                    <dd style={{ textTransform: 'capitalize' }}>{listing.type}</dd>
                                </div>
                                <div>
                                    <dt>Status</dt>
                                    <dd style={{ color: '#4ade80' }}>Available</dd>
                                </div>
                                <div>
                                    <dt>Listed By</dt>
                                    <dd>{listing.seller ? listing.seller.fullName : 'Marefia'}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* CTA BUTTONS */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button
                                className="btn-gold"
                                style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '0.9rem' }}
                                onClick={() => alert('An inquiry form or contact modal would open here.')}
                            >
                                Inquire Now
                            </button>
                            <button
                                className="btn-ghost"
                                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '0.85rem' }}
                                onClick={() => alert('Schedule a private viewing.')}
                            >
                                Schedule Viewing
                            </button>
                        </div>

                        {/* TRUST NOTE */}
                        <p style={{ marginTop: '20px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.6' }}>
                            🔒 All transactions are handled with full discretion and legal escrow support.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── LIGHTBOX ── */}
            {lightboxOpen && (
                <div
                    className="lightbox-overlay"
                    onClick={() => setLightboxOpen(false)}
                >
                    <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>✕</button>
                        <img
                            src={images[activeImage]}
                            alt={`${listing.title} — full view`}
                            className="lightbox-img"
                            onError={(e) => { e.target.src = fallbackImage(listing.type); }}
                        />
                        {images.length > 1 && (
                            <>
                                <button className="lightbox-arrow lightbox-arrow-left" onClick={prevImage}>‹</button>
                                <button className="lightbox-arrow lightbox-arrow-right" onClick={nextImage}>›</button>
                                <div className="lightbox-count">{activeImage + 1} / {images.length}</div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ListingDetailPage;