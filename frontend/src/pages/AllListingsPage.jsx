import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import ListingCard from '../components/ListingCard';
import LoadingScreen from '../components/LoadingScreen';
import EmptyState from '../components/EmptyState';

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
                (item.title || '').toLowerCase().includes(query) ||
                (item.locationAddressPublic || '').toLowerCase().includes(query)
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
                        <h4 style={{ color: 'var(--white)', margin: '0 0 20px 0', fontSize: '1.1rem' }}>
                            Filter Showroom
                        </h4>

                        <div className="form-group" style={{ marginBottom: '24px' }}>
                            <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                                Keyword Search
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. villa, Porsche, London..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', width: '100%', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--white)' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '24px' }}>
                            <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                                Asset Category
                            </label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', width: '100%', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--white)' }}
                            >
                                <option value="all">All Categories</option>
                                <option value="house">Real Estate</option>
                                <option value="car">Automotive</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: '24px' }}>
                            <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                                Agreement Type
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
                        <LoadingScreen text="Loading catalogue..." />
                    ) : error ? (
                        <p className="alert alert-danger">{error}</p>
                    ) : filteredListings.length === 0 ? (
                        <EmptyState
                            icon="🔍"
                            title="No Matching Listings"
                            description="No listings matched your criteria. Try adjusting your filters."
                            action={
                                hasActiveFilters && (
                                    <button className="btn-ghost" onClick={clearFilters} style={{ marginTop: '20px' }}>
                                        Clear All Filters
                                    </button>
                                )
                            }
                        />
                    ) : (
                        <div className="listings-grid" style={{ marginTop: 0 }}>
                            {filteredListings.map((listing) => (
                                <ListingCard key={listing.id} listing={listing} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AllListingsPage;
