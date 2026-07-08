import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function ListingCard({ listing, showViews = false, showStatus = false }) {
    const { user } = useContext(AuthContext);
    const showListedBy = user && (user.role === 'admin' || user.role === 'broker');
    // Helpers to resolve listing image URLs
    const getListingImageUrl = (listing) => {
        if (listing.images && listing.images.length > 0) {
            const firstImage = listing.images[0];
            if (typeof firstImage === 'string') {
                return firstImage;
            }
        }
        
        // Fallback static high quality premium images based on type
        return listing.type === 'house'
            ? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
            : 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80';
    };

    const handleImageError = (e) => {
        e.target.src = listing.type === 'house'
            ? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
            : 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80';
    };

    return (
        <Link to={`/listing/${listing.id}`} className="listing-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <img
                src={getListingImageUrl(listing)}
                alt={listing.title}
                className="listing-image"
                onError={handleImageError}
            />
            <div className="listing-card-body">
                {showStatus ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span className={`status-badge status-${listing.status.toLowerCase()}`}>
                            {listing.status}
                        </span>
                        <span className="listing-card-tag" style={{ margin: 0 }}>
                            {listing.type === 'house' ? '🏠 Property' : '🚗 Vehicle'}
                        </span>
                    </div>
                ) : (
                    <div className="listing-card-tag">
                        {listing.type === 'house' ? '🏠 Property' : '🚗 Vehicle'}
                        &nbsp;·&nbsp;
                        {listing.category === 'for_sale' ? 'For Sale' : 'For Rent'}
                    </div>
                )}
                
                <h3>{listing.title}</h3>
                
                <div className="listing-price">
                    ${parseFloat(listing.price).toLocaleString()}
                    {listing.category === 'for_rent' && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/mo</span>
                    )}
                </div>
                
                <div className="listing-meta">
                    <span>📍 {listing.locationAddressPublic}</span>
                    {showListedBy && (
                        <span>👤 {listing.seller ? listing.seller.fullName : 'Marefia Representative'}</span>
                    )}
                    {showViews && (
                        <span style={{ color: 'var(--gold)', marginTop: '4px' }}>👁️ {listing.views || 0} views</span>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default ListingCard;
