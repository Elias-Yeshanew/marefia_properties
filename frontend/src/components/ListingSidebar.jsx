import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';

function ListingSidebar({ listing }) {
    const { user } = useContext(AuthContext);
    const showListedBy = user && (user.role === 'admin' || user.role === 'broker');
    return (
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
                        {showListedBy && (
                            <div>
                                <dt>Listed By</dt>
                                <dd>{listing.seller ? listing.seller.fullName : 'Marefia'}</dd>
                            </div>
                        )}
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
    );
}

export default ListingSidebar;
