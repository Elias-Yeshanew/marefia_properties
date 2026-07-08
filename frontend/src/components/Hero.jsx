import React from 'react';

function Hero({ exploreAnchor = '#showroom' }) {
    return (
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
                <a href={exploreAnchor} className="btn-gold" style={{ display: 'inline-block', textDecoration: 'none', marginTop: '10px' }}>Explore Showroom</a>
            </div>
        </header>
    );
}

export default Hero;
