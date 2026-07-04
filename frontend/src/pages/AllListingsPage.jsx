import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function AllListingsPage() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Search and Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterPrice, setFilterPrice] = useState('all');

    useEffect(() => {
        const fetchListings = async () => {
            try {
                setLoading(true);
                const response = await api.get('/listings/approved');
                setListings(response.data);
            } catch (err) {
                setError('Unable to load properties. Please try again later.');
                console.error('Error fetching approved listings:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, []);

    // Derive filtered listings using useMemo
    const filteredListings = useMemo(() => {
        let temp = [...listings];
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            temp = temp.filter(item =>
                item.title.toLowerCase().includes(query) ||
                item.locationAddressPublic.toLowerCase().includes(query)
            );
        }
        if (filterType !== 'all') temp = temp.filter(item => item.type === filterType);
        if (filterCategory !== 'all') temp = temp.filter(item => item.category === filterCategory);
        if (filterPrice === 'low') temp = temp.filter(item => parseFloat(item.price) < 100000);
        else if (filterPrice === 'mid') temp = temp.filter(item => parseFloat(item.price) >= 100000 && parseFloat(item.price) <= 1000000);
        else if (filterPrice === 'high') temp = temp.filter(item => parseFloat(item.price) > 1000000 && parseFloat(item.price) <= 5000000);
        else if (filterPrice === 'ultra') temp = temp.filter(item => parseFloat(item.price) > 5000000);
        return temp;
    }, [searchQuery, filterType, filterCategory, filterPrice, listings]);

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

    const hasActiveFilters = filterType !== 'all' || filterCategory !== 'all' || filterPrice !== 'all' || searchQuery !== '';

    const clearFilters = () => {
        setSearchQuery('');
        setFilterType('all');
        setFilterCategory('all');
        setFilterPrice('all');
    };

    return (
        <div>
            {/* ── PAGE HEADER ── */}
            <div style={{ marginBottom: '40px' }}>
                <span className="section-label">Complete Catalogue</span>
                <span className="gold-line"></span>
                <h1 style={{ color: 'var(--white)', fontSize: 'clamp(2rem, 4vw, 3rem)', margin: '12px 0 8px 0', fontStyle: 'italic' }}>
                    All Listings
                </h1>
                <p style={{ color: 'var(--text-muted)', maxWidth: '520px' }}>
                    Browse our full collection of approved luxury properties and premium automotive assets.
                    {!loading && (
                        <span style={{ color: 'var(--gold)', marginLeft: '8px' }}>
                            {filteredListings.length} {filteredListings.length === 1 ? 'result' : 'results'}
                            {hasActiveFilters && ` (filtered from ${listings.length})`}
                        </span>
                    )}
                </p>
            </div>

            {/* ── SIDEBAR + GRID LAYOUT ── */}
            <div className="showroom-layout">

                {/* ── STICKY SIDEBAR FILTERS ── */}
                <aside className="showroom-sidebar">
                    <div className="glass-card" style={{
                        padding: '30px 24px',
                        border: '1px solid rgba(201,168,76,0.18)',
                        boxShadow: 'var(--shadow-deep)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.25rem', color: 'var(--gold)', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', margin: 0 }}>
                                Refine Selection
                            </h3>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline', padding: 0 }}
                                >
                                    Reset
                                </button>
                            )}
                        </div>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                                Search Keywords
                            </label>
                            <input
                                type="text"
                                placeholder="City, neighborhood, title..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', width: '100%', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--white)', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                                Asset Type
                            </label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', width: '100%', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--white)' }}
                            >
                                <option value="all">All Assets</option>
                                <option value="house">Real Estate</option>
                                <option value="car">Automotive</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                                Category
                            </label>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', width: '100%', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--white)' }}
                            >
                                <option value="all">Buy or Rent</option>
                                <option value="for_sale">Acquisition</option>
                                <option value="for_rent">Leasing</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: hasActiveFilters ? '24px' : 0 }}>
                            <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                                Price Bracket
                            </label>
                            <select
                                value={filterPrice}
                                onChange={(e) => setFilterPrice(e.target.value)}
                                style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', width: '100%', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--white)' }}
                            >
                                <option value="all">Any Price</option>
                                <option value="low">Under $100K</option>
                                <option value="mid">$100K – $1.0M</option>
                                <option value="high">$1.0M – $5.0M</option>
                                <option value="ultra">$5.0M+</option>
                            </select>
                        </div>

                        {hasActiveFilters && (
                            <button
                                className="btn-ghost"
                                onClick={clearFilters}
                                style={{ width: '100%', padding: '12px 14px', height: 'auto' }}
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                </aside>

                {/* ── LISTINGS GRID ── */}
                <div>
                    {loading ? (
                        <div className="loading-screen" style={{ minHeight: '300px' }}>
                            <div className="spinner"></div>
                            <p className="loading-text">Loading catalogue...</p>
                        </div>
                    ) : error ? (
                        <p className="alert alert-danger">{error}</p>
                    ) : filteredListings.length === 0 ? (
                        <div className="empty-state" style={{ padding: '60px 24px' }}>
                            <div className="empty-icon">🔍</div>
                            <h3>No Matching Listings</h3>
                            <p>No listings matched your criteria. Try adjusting your filters.</p>
                            {hasActiveFilters && (
                                <button className="btn-ghost" onClick={clearFilters} style={{ marginTop: '20px' }}>
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="listings-grid" style={{ marginTop: 0 }}>
                            {filteredListings.map((listing) => (
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
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AllListingsPage;
