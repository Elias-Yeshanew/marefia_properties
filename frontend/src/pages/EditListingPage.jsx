import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

function EditListingPage() {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'house',
        category: 'for_sale',
        price: '',
        locationAddressPublic: '',
    });

    // Images already uploaded (Cloudinary URLs)
    const [existingImages, setExistingImages] = useState([]);
    // Images marked for removal
    const [removedImages, setRemovedImages] = useState([]);
    // New images chosen locally
    const [newFiles, setNewFiles] = useState([]);
    const [newPreviews, setNewPreviews] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [unauthorized, setUnauthorized] = useState(false);

    useEffect(() => {
        const fetchListing = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/listings/approved/${id}`);
                const listing = response.data;

                // Guard: only owner or admin may access this page
                if (user && user.role !== 'admin' && listing.sellerId !== user.id) {
                    setUnauthorized(true);
                    return;
                }

                setFormData({
                    title: listing.title || '',
                    description: listing.description || '',
                    type: listing.type || 'house',
                    category: listing.category || 'for_sale',
                    price: listing.price || '',
                    locationAddressPublic: listing.locationAddressPublic || '',
                });
                setExistingImages(listing.images || []);
            } catch (err) {
                setError('Failed to load listing details. You may not have permission to edit this listing.');
                console.error('Error fetching listing for edit:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchListing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setNewFiles(files);
        setNewPreviews(files.map((f) => URL.createObjectURL(f)));
    };

    const handleRemoveExistingImage = (url) => {
        setRemovedImages((prev) => [...prev, url]);
        setExistingImages((prev) => prev.filter((img) => img !== url));
    };

    const handleRestoreImage = (url) => {
        setRemovedImages((prev) => prev.filter((img) => img !== url));
        setExistingImages((prev) => [...prev, url]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setSaving(true);

        try {
            const data = new FormData();
            // Text fields
            for (const key in formData) {
                data.append(key, formData[key]);
            }
            // Send the list of images to keep
            data.append('retainedImages', JSON.stringify(existingImages));
            // New file uploads
            newFiles.forEach((file) => data.append('images', file));

            await api.put(`/listings/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setSuccess('Listing updated successfully!');
            setTimeout(() => {
                if (user?.role === 'admin') {
                    navigate('/admin/listings');
                } else {
                    navigate('/seller/my-listings');
                }
            }, 1800);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update listing.');
            console.error('Update listing error:', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingScreen text="Loading Listing" />;

    if (unauthorized) return (
        <div className="form-page" style={{ textAlign: 'center', paddingTop: '80px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '24px' }}>🔒</div>
            <h2 style={{ color: 'var(--white)', marginBottom: '12px' }}>Access Denied</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
                You do not have permission to edit this listing.
            </p>
            <Link to="/listings" className="btn-gold">Browse Listings</Link>
        </div>
    );

    if (error && !formData.title) return (
        <div className="form-page" style={{ textAlign: 'center', paddingTop: '80px' }}>
            <p className="alert alert-danger">{error}</p>
            <Link to="/listings" className="btn-gold" style={{ marginTop: '24px', display: 'inline-block' }}>
                Browse Listings
            </Link>
        </div>
    );

    return (
        <div className="form-page">
            {/* Header */}
            <div className="page-header" style={{ textAlign: 'center' }}>
                <span className="section-label">Update Listing</span>
                <span className="gold-line" style={{ margin: '16px auto' }}></span>
                <h2>Edit Property Details</h2>
                <p style={{ margin: '10px auto' }}>
                    Modify any details below. {user?.role !== 'admin' && (
                        <span style={{ color: 'var(--gold)' }}>Note: edits will require re-approval.</span>
                    )}
                </p>
            </div>

            <div className="glass-card" style={{ padding: '40px' }}>
                <form onSubmit={handleSubmit}>

                    {/* Title */}
                    <div className="form-group">
                        <label htmlFor="edit-title">Listing Title</label>
                        <input
                            type="text"
                            id="edit-title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Luxury Villa in Beverly Hills"
                        />
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label htmlFor="edit-description">Detailed Description</label>
                        <textarea
                            id="edit-description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            placeholder="Describe the unique features and amenities..."
                        />
                    </div>

                    {/* Type & Category */}
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="edit-type">Property Type</label>
                            <select id="edit-type" name="type" value={formData.type} onChange={handleChange} required>
                                <option value="house">House / Real Estate</option>
                                <option value="car">Car / Vehicle</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="edit-category">Listing Category</label>
                            <select id="edit-category" name="category" value={formData.category} onChange={handleChange} required>
                                <option value="for_sale">For Sale</option>
                                <option value="for_rent">For Rent</option>
                            </select>
                        </div>
                    </div>

                    {/* Price & Location */}
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="edit-price">Price (USD)</label>
                            <input
                                type="number"
                                id="edit-price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                step="0.01"
                                placeholder="e.g. 1500000"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="edit-location">Public Location</label>
                            <input
                                type="text"
                                id="edit-location"
                                name="locationAddressPublic"
                                value={formData.locationAddressPublic}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Miami, Florida"
                            />
                        </div>
                    </div>

                    {/* Existing images */}
                    <div className="form-group">
                        <label>Current Images</label>
                        {existingImages.length === 0 && removedImages.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No images attached.</p>
                        ) : (
                            <div className="image-preview-grid">
                                {existingImages.map((url, i) => (
                                    <div key={url} style={{ position: 'relative' }}>
                                        <img src={url} alt={`existing-${i}`} style={{ opacity: 1 }} />
                                        <button
                                            type="button"
                                            title="Remove image"
                                            onClick={() => handleRemoveExistingImage(url)}
                                            style={{
                                                position: 'absolute',
                                                top: '6px',
                                                right: '6px',
                                                background: 'rgba(239,68,68,0.85)',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '26px',
                                                height: '26px',
                                                cursor: 'pointer',
                                                color: '#fff',
                                                fontWeight: '700',
                                                fontSize: '0.9rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                lineHeight: 1,
                                                backdropFilter: 'blur(4px)',
                                            }}
                                        >×</button>
                                    </div>
                                ))}
                                {removedImages.map((url, i) => (
                                    <div key={`removed-${i}`} style={{ position: 'relative' }}>
                                        <img
                                            src={url}
                                            alt={`removed-${i}`}
                                            style={{ opacity: 0.35, filter: 'grayscale(80%)' }}
                                        />
                                        <button
                                            type="button"
                                            title="Restore image"
                                            onClick={() => handleRestoreImage(url)}
                                            style={{
                                                position: 'absolute',
                                                top: '6px',
                                                right: '6px',
                                                background: 'rgba(201,168,76,0.85)',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '26px',
                                                height: '26px',
                                                cursor: 'pointer',
                                                color: '#000',
                                                fontWeight: '700',
                                                fontSize: '0.85rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                lineHeight: 1,
                                                backdropFilter: 'blur(4px)',
                                            }}
                                        >↺</button>
                                        <span style={{
                                            position: 'absolute',
                                            bottom: '6px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            background: 'rgba(239,68,68,0.8)',
                                            color: '#fff',
                                            fontSize: '0.6rem',
                                            fontWeight: '700',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            letterSpacing: '0.08em',
                                            textTransform: 'uppercase',
                                            whiteSpace: 'nowrap',
                                        }}>Removed</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* New image uploads */}
                    <div className="form-group">
                        <label htmlFor="edit-images">Add New Images (optional)</label>
                        <input
                            type="file"
                            id="edit-images"
                            name="images"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ padding: '8px 0' }}
                        />
                        {newPreviews.length > 0 && (
                            <div className="image-preview-grid">
                                {newPreviews.map((src, i) => (
                                    <img key={i} src={src} alt={`new-preview-${i}`} />
                                ))}
                            </div>
                        )}
                    </div>

                    {error && <p className="alert alert-danger">{error}</p>}
                    {success && <p className="alert alert-success">{success}</p>}

                    <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            className="btn-ghost"
                            onClick={() => navigate(-1)}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn-gold" disabled={saving}>
                            {saving ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditListingPage;
