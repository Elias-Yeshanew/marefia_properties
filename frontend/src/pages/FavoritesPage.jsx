import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ListingCard from '../components/ListingCard';
import LoadingScreen from '../components/LoadingScreen';
import EmptyState from '../components/EmptyState';

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
                <LoadingScreen text="Loading favorites..." />
            ) : error ? (
                <p className="alert alert-danger">{error}</p>
            ) : listings.length === 0 ? (
                <EmptyState
                    icon="❤️"
                    title="Your favorites list is empty"
                    description="Click the heart icon on any property or vehicle detail page to add it to your favorites list."
                    action={
                        <Link to="/listings" className="btn-gold" style={{ marginTop: '20px', display: 'inline-block', textDecoration: 'none' }}>
                            Browse All Listings
                        </Link>
                    }
                />
            ) : (
                <div className="listings-grid" style={{ marginTop: 0 }}>
                    {listings.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} showViews={true} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default FavoritesPage;
