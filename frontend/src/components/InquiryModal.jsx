import { useState, useEffect, useContext, useCallback } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const today = new Date().toISOString().split('T')[0];

const TIME_SLOTS = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
];

function InquiryModal({ listing, initialTab = 'inquiry', onClose }) {
    const { user } = useContext(AuthContext);
    const [tab, setTab] = useState(initialTab); // 'inquiry' | 'viewing'
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const defaultForm = useCallback(() => ({
        name: user?.fullName || '',
        email: user?.email || '',
        phone: '',
        message: '',
        preferredDate: '',
        preferredTime: TIME_SLOTS[2],
    }), [user]);

    const [form, setForm] = useState(defaultForm);

    // Reset when tab changes
    useEffect(() => {
        setForm(defaultForm());
        setError(null);
        setSubmitted(false);
    }, [tab, defaultForm]);

    // Close on Escape key
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await api.post('/inquiries', {
                listingId: listing.id,
                type: tab,
                name: form.name,
                email: form.email,
                phone: form.phone,
                message: form.message,
                preferredDate: tab === 'viewing' ? form.preferredDate : undefined,
                preferredTime: tab === 'viewing' ? form.preferredTime : undefined,
            });
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="modal-overlay"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            role="dialog"
            aria-modal="true"
        >
            <div className="modal-card">
                {/* Close button */}
                <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>

                {/* Header */}
                <div style={{ marginBottom: '24px' }}>
                    <span className="section-label" style={{ fontSize: '0.6rem' }}>
                        {listing.type === 'house' ? '🏠 Property' : '🚗 Vehicle'}
                    </span>
                    <h2 style={{ color: 'var(--white)', margin: '6px 0 4px', fontSize: '1.35rem', lineHeight: 1.3 }}>
                        {listing.title}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                        📍 {listing.locationAddressPublic || 'Location on request'}
                    </p>
                </div>

                {/* Tabs */}
                <div className="modal-tabs">
                    <button
                        className={`modal-tab ${tab === 'inquiry' ? 'modal-tab-active' : ''}`}
                        onClick={() => setTab('inquiry')}
                    >
                        💬 Inquire Now
                    </button>
                    <button
                        className={`modal-tab ${tab === 'viewing' ? 'modal-tab-active' : ''}`}
                        onClick={() => setTab('viewing')}
                    >
                        📅 Schedule Viewing
                    </button>
                </div>

                {/* Success state */}
                {submitted ? (
                    <div className="modal-success">
                        <span className="modal-success-icon">
                            {tab === 'viewing' ? '📅' : '✅'}
                        </span>
                        <h3>
                            {tab === 'viewing' ? 'Viewing Requested!' : 'Inquiry Sent!'}
                        </h3>
                        <p>
                            {tab === 'viewing'
                                ? `Your viewing request for ${form.preferredDate} at ${form.preferredTime} has been received. Our team will confirm shortly.`
                                : "We've received your message and will get back to you as soon as possible."}
                        </p>
                        <button
                            className="btn-ghost"
                            onClick={onClose}
                            style={{ marginTop: '24px', width: '100%', justifyContent: 'center' }}
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} noValidate>
                        {/* Name + Email */}
                        <div className="modal-form-row">
                            <div className="modal-form-group">
                                <label htmlFor="inq-name">Full Name *</label>
                                <input
                                    id="inq-name"
                                    name="name"
                                    type="text"
                                    required
                                    placeholder="John Doe"
                                    value={form.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="modal-form-group">
                                <label htmlFor="inq-email">Email *</label>
                                <input
                                    id="inq-email"
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="john@example.com"
                                    value={form.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="modal-form-group">
                            <label htmlFor="inq-phone">Phone (optional)</label>
                            <input
                                id="inq-phone"
                                name="phone"
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                value={form.phone}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Viewing-specific fields */}
                        {tab === 'viewing' && (
                            <div className="modal-form-row">
                                <div className="modal-form-group">
                                    <label htmlFor="inq-date">Preferred Date *</label>
                                    <input
                                        id="inq-date"
                                        name="preferredDate"
                                        type="date"
                                        required
                                        min={today}
                                        value={form.preferredDate}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="modal-form-group">
                                    <label htmlFor="inq-time">Preferred Time</label>
                                    <select
                                        id="inq-time"
                                        name="preferredTime"
                                        value={form.preferredTime}
                                        onChange={handleChange}
                                    >
                                        {TIME_SLOTS.map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Message */}
                        <div className="modal-form-group">
                            <label htmlFor="inq-message">
                                {tab === 'viewing' ? 'Additional Notes (optional)' : 'Your Message *'}
                            </label>
                            <textarea
                                id="inq-message"
                                name="message"
                                required={tab === 'inquiry'}
                                placeholder={
                                    tab === 'viewing'
                                        ? 'Any special requests or access requirements…'
                                        : "Tell us what you'd like to know about this listing…"
                                }
                                value={form.message}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <p style={{ color: '#f87171', fontSize: '0.82rem', marginBottom: '14px' }}>
                                ⚠️ {error}
                            </p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            className="btn-gold"
                            disabled={loading}
                            style={{ width: '100%', justifyContent: 'center', padding: '15px', fontSize: '0.9rem' }}
                        >
                            {loading
                                ? 'Sending…'
                                : tab === 'viewing'
                                    ? '📅 Request Viewing'
                                    : '💬 Send Inquiry'}
                        </button>

                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '14px' }}>
                            🔒 Your details are kept strictly confidential.
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}

export default InquiryModal;
