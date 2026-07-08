import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ListingCard from '../components/ListingCard';
import LoadingScreen from '../components/LoadingScreen';
import EmptyState from '../components/EmptyState';

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

    if (loading) return <LoadingScreen text="Loading Portfolio" />;

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
                <EmptyState
                    icon="📋"
                    title="No Listings Found"
                    description="You haven't added any properties to your portfolio yet."
                    action={
                        <Link to="/seller/create-listing" className="btn-gold" style={{ marginTop: '20px' }}>
                            Create First Listing
                        </Link>
                    }
                />
            ) : (
                <div className="listings-grid">
                    {listings.map((listing) => (
                        <div key={listing.id} style={{ position: 'relative' }}>
                            <ListingCard listing={listing} showStatus={true} />
                            <Link
                                to={`/listings/edit/${listing.id}`}
                                style={{
                                    display: 'block',
                                    textAlign: 'center',
                                    marginTop: '8px',
                                    padding: '9px 0',
                                    background: 'rgba(201,168,76,0.08)',
                                    border: '1px solid rgba(201,168,76,0.25)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--gold)',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    textDecoration: 'none',
                                    transition: 'var(--transition)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(201,168,76,0.18)';
                                    e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(201,168,76,0.08)';
                                    e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)';
                                }}
                            >
                                ✏️ Edit Listing
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SellerListingsPage;