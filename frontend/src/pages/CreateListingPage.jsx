import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AuthContext from '../context/AuthContext';

function CreateListingPage() {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'house',
        category: 'for_sale',
        price: '',
        locationAddressPublic: '',
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);

        const filePreviews = files.map(file => URL.createObjectURL(file));
        setPreviewImages(filePreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        const data = new FormData();
        for (const key in formData) {
            data.append(key, formData[key]);
        }
        selectedFiles.forEach((file) => {
            data.append('images', file);
        });

        try {
            const response = await api.post('/listings', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccess(response.data.message);
            setFormData({
                title: '', description: '', type: 'house', category: 'for_sale',
                price: '', locationAddressPublic: '',
            });
            setSelectedFiles([]);
            setPreviewImages([]);
            setTimeout(() => {
                if (user?.role === 'admin' || user?.role === 'broker') {
                    navigate('/admin/listings');
                } else {
                    navigate('/seller/my-listings');
                }
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create listing.');
            console.error('Create listing error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-page">
            <div className="page-header" style={{ textAlign: 'center' }}>
                <span className="section-label">List With Us</span>
                <span className="gold-line" style={{ margin: '16px auto' }}></span>
                <h2>New Property Listing</h2>
                <p style={{ margin: '10px auto' }}>Submit a new property or vehicle to the Marefia Properties portfolio.</p>
            </div>

            <div className="glass-card" style={{ padding: '40px' }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Listing Title</label>
                        <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Luxury Villa in Beverly Hills" />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="description">Detailed Description</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} required placeholder="Describe the unique features and amenities..."></textarea>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="type">Property Type</label>
                            <select id="type" name="type" value={formData.type} onChange={handleChange} required>
                                <option value="house">House / Real Estate</option>
                                <option value="car">Car / Vehicle</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="category">Listing Category</label>
                            <select id="category" name="category" value={formData.category} onChange={handleChange} required>
                                <option value="for_sale">For Sale</option>
                                <option value="for_rent">For Rent</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="price">Price (USD)</label>
                            <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required step="0.01" placeholder="e.g. 1500000" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="locationAddressPublic">Public Location</label>
                            <input type="text" id="locationAddressPublic" name="locationAddressPublic" value={formData.locationAddressPublic} onChange={handleChange} required placeholder="e.g. Miami, Florida" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="images">High-Resolution Images</label>
                        <input
                            type="file"
                            id="images"
                            name="images"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ padding: '8px 0' }}
                        />
                        {previewImages.length > 0 && (
                            <div className="image-preview-grid">
                                {previewImages.map((src, index) => (
                                    <img key={index} src={src} alt={`preview-${index}`} />
                                ))}
                            </div>
                        )}
                    </div>

                    {error && <p className="alert alert-danger">{error}</p>}
                    {success && <p className="alert alert-success">{success}</p>}
                    
                    <div style={{ marginTop: '32px', textAlign: 'right' }}>
                        <button type="submit" className="btn-gold" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Listing'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateListingPage;