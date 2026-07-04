import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function HomePage() {
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

    // Derive filtered listings from state using useMemo (no extra effect needed)
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

    // Helpers to resolve listing image URLs
    const getListingImageUrl = (listing) => {
        if (listing.images && listing.images.length > 0) {
            // Verify if it is an array and the first element is a string
            const firstImage = listing.images[0];
            if (typeof firstImage === 'string') {
                return firstImage;
            }
        }
        
        // Fallback static high quality premium images based on type
        if (listing.type === 'house') {
            return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
        } else {
            return 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80';
        }
    };

    return (
        <div style={{ margin: '0 -48px', position: 'relative' }}>
            {/* ── HERO SECTION ── */}
            <header className="hero-banner" style={{
                height: '70vh',
                minHeight: '550px',
                backgroundImage: 'linear-gradient(to bottom, rgba(4,12,36,0.3) 0%, rgba(4,12,36,0.95) 100%), url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0 24px',
                textAlign: 'center',
                position: 'relative'
            }}>
                <div style={{ maxWidth: '800px', width: '100%', zIndex: 2 }}>
                    <span className="section-label" style={{ color: 'var(--gold)', letterSpacing: '0.3em' }}>Welcome to Marefia Properties</span>
                    <h1 style={{ color: 'var(--white)', margin: '16px 0 24px 0', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontStyle: 'italic' }}>
                        Curated Heritage. Infinite Possibilities.
                    </h1>
                    <p style={{ color: 'var(--text-light)', fontSize: 'clamp(0.95rem, 1.8vw, 1.25rem)', maxWidth: '620px', margin: '0 auto 40px auto', fontWeight: 3 }}>
                        Acquire and lease the world’s most coveted residences and premium automotive assets with absolute security and discretion.
                    </p>
                    <a href="#showroom" className="btn-gold" style={{ display: 'inline-block', textDecoration: 'none', marginTop: '10px' }}>Explore Showroom</a>
                </div>
            </header>

            {/* ── MAIN CONTENT CONTAINER ── */}
            <div style={{ padding: '80px 48px 0 48px', maxWidth: '1376px', margin: '0 auto' }}>

                {/* ── BRAND STATS SECTION ── */}
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px', margin: '0 auto 90px auto', textAlign: 'center' }}>
                    <div className="glass-card" style={{ padding: '30px 20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '2.5rem', color: 'var(--gold)', marginBottom: '5px' }}>$1.4B+</h3>
                        <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>Transactions Completed</p>
                    </div>
                    <div className="glass-card" style={{ padding: '30px 20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '2.5rem', color: 'var(--gold)', marginBottom: '5px' }}>99%</h3>
                        <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>Client Retention Rate</p>
                    </div>
                    <div className="glass-card" style={{ padding: '30px 20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '2.5rem', color: 'var(--gold)', marginBottom: '5px' }}>15+</h3>
                        <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>Global Locations</p>
                    </div>
                    <div className="glass-card" style={{ padding: '30px 20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '2.5rem', color: 'var(--gold)', marginBottom: '5px' }}>24hr</h3>
                        <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>Response Guarantee</p>
                    </div>
                </section>

                {/* ── PORTFOLIO SECTION ── */}
                <section id="showroom" style={{ marginBottom: '100px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
                        <div>
                            <span className="section-label">Exclusive Showroom</span>
                            <span className="gold-line"></span>
                            <h2>Featured Collections</h2>
                            <p style={{ margin: '10px 0 0 0' }}>Explore properties and luxury vehicles vetted under the highest global luxury standards.</p>
                        </div>
                        <Link to="/listings" className="btn-ghost" style={{ textDecoration: 'none', height: 'fit-content', whiteSpace: 'nowrap' }}>
                            View All Listings →
                        </Link>
                    </div>

                    {/* ── TOP FILTER BAR ── */}
                    <div className="glass-card" style={{
                        padding: '20px 24px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: '16px',
                        border: '1px solid rgba(201,168,76,0.18)',
                        marginBottom: '32px',
                    }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>Search</label>
                            <input
                                type="text"
                                placeholder="City, neighborhood, title..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px' }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>Asset Type</label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px' }}
                            >
                                <option value="all">All Assets</option>
                                <option value="house">Real Estate</option>
                                <option value="car">Automotive</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>Category</label>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px' }}
                            >
                                <option value="all">Buy or Rent</option>
                                <option value="for_sale">Acquisition</option>
                                <option value="for_rent">Leasing</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>Price</label>
                            <select
                                value={filterPrice}
                                onChange={(e) => setFilterPrice(e.target.value)}
                                style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px' }}
                            >
                                <option value="all">Any Price</option>
                                <option value="low">Under $100K</option>
                                <option value="mid">$100K – $1.0M</option>
                                <option value="high">$1.0M – $5.0M</option>
                                <option value="ultra">$5.0M+</option>
                            </select>
                        </div>
                        {(filterType !== 'all' || filterCategory !== 'all' || filterPrice !== 'all' || searchQuery !== '') && (
                            <div className="form-group" style={{ marginBottom: 0, display: 'flex', alignItems: 'flex-end' }}>
                                <button
                                    className="btn-ghost"
                                    onClick={() => { setSearchQuery(''); setFilterType('all'); setFilterCategory('all'); setFilterPrice('all'); }}
                                    style={{ width: '100%', height: 'auto', padding: '10px 14px' }}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ── LISTINGS GRID ── */}
                    {loading ? (
                        <div className="loading-screen" style={{ minHeight: '250px' }}>
                            <div className="spinner"></div>
                            <p className="loading-text">Loading showroom...</p>
                        </div>
                    ) : error ? (
                        <p className="alert alert-danger">{error}</p>
                    ) : filteredListings.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🔍</div>
                            <h3>No Matching Listings</h3>
                            <p>No listings matched your criteria. Try adjusting your query or filters.</p>
                        </div>
                    ) : (
                        <div className="listings-grid">
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
                                            {listing.category === 'for_rent' && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/mo</span>}
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
                </section>

                {/* ── LUXURY VALUE PROP SECTION ── */}
                <section style={{ marginBottom: '100px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'center' }}>
                    <div>
                        <span className="section-label">Unrivaled Standards</span>
                        <span className="gold-line"></span>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Beyond Brokerage.</h2>
                        <p style={{ marginBottom: '20px' }}>
                            At Marefia Properties, we believe that premium asset management is an art form. We don't simply facilitate transactions; we build legacies.
                        </p>
                        <p style={{ marginBottom: '30px' }}>
                            Our team leverages an international network of ultra-high-net-worth individuals, institutional capital, and master mechanics to authenticate, list, and transfer ownership of the world's finest assets.
                        </p>
                        <Link to="/register" className="btn-gold">Join the Club</Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="glass-card" style={{ padding: '30px 20px', borderLeft: '3px solid var(--gold)' }}>
                            <h4 style={{ color: 'var(--white)', fontSize: '1.2rem', marginBottom: '10px' }}>Global Reach</h4>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                Reach active luxury buyers in London, Dubai, New York, and Hong Kong instantly.
                            </p>
                        </div>
                        <div className="glass-card" style={{ padding: '30px 20px', borderLeft: '3px solid var(--gold)' }}>
                            <h4 style={{ color: 'var(--white)', fontSize: '1.2rem', marginBottom: '10px' }}>Verification</h4>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                Rigorous history reviews, land registry checking, and structural engineering signoffs.
                            </p>
                        </div>
                        <div className="glass-card" style={{ padding: '30px 20px', borderLeft: '3px solid var(--gold)' }}>
                            <h4 style={{ color: 'var(--white)', fontSize: '1.2rem', marginBottom: '10px' }}>Concierge</h4>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                End-to-end luxury transportation handling, legal escrows, and title transfers handled directly by us.
                            </p>
                        </div>
                        <div className="glass-card" style={{ padding: '30px 20px', borderLeft: '3px solid var(--gold)' }}>
                            <h4 style={{ color: 'var(--white)', fontSize: '1.2rem', marginBottom: '10px' }}>Discretion</h4>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                Private viewing requests, encrypted messaging channels, and non-disclosure listing support.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── CLIENT TESTIMONIALS ── */}
                <section style={{ marginBottom: '100px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(251,191,36,0.05)', padding: '60px 40px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                    <span className="section-label">Client Narratives</span>
                    <span className="gold-line" style={{ margin: '16px auto' }}></span>
                    <p style={{ fontStyle: 'italic', fontSize: '1.4rem', color: 'var(--white)', maxWidth: '800px', margin: '0 auto 24px auto', fontFamily: 'Cormorant Garamond, serif' }}>
                        "The transaction speed and complete discretion with which Marefia Properties handled the acquisition of our penthouse in New York and the accompanying classic car collection was stellar. Unmatched service."
                    </p>
                    <span style={{ fontSize: '0.78rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 6 }}>
                        — Sir Arthur F., Real Estate Investor & Collector
                    </span>
                </section>

            </div>
        </div>
    );
}

export default HomePage;