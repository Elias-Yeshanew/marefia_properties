import React, { useState } from 'react';

function ListingGallery({ images = [], type = 'house', title = 'Asset' }) {
    const [activeImage, setActiveImage] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const safeImages = images && images.length > 0 ? images : [];

    const nextImage = (e) => {
        if (e) e.stopPropagation();
        setActiveImage((prev) => (prev + 1) % safeImages.length);
    };

    const prevImage = (e) => {
        if (e) e.stopPropagation();
        setActiveImage((prev) => (prev - 1 + safeImages.length) % safeImages.length);
    };

    const fallbackImage = (type) => {
        return type === 'house'
            ? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
            : 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80';
    };

    if (safeImages.length === 0) {
        return (
            <div className="gallery-main-wrapper">
                <img
                    src={fallbackImage(type)}
                    alt={title}
                    className="gallery-main-img"
                />
            </div>
        );
    }

    return (
        <>
            {/* MAIN IMAGE */}
            <div className="gallery-main-wrapper" onClick={() => setLightboxOpen(true)}>
                <img
                    src={safeImages[activeImage]}
                    alt={`${title} — view ${activeImage + 1}`}
                    className="gallery-main-img"
                    onError={(e) => { e.target.src = fallbackImage(type); }}
                />
                {safeImages.length > 1 && (
                    <>
                        <button className="gallery-arrow gallery-arrow-left" onClick={(e) => { e.stopPropagation(); prevImage(); }} aria-label="Previous">‹</button>
                        <button className="gallery-arrow gallery-arrow-right" onClick={(e) => { e.stopPropagation(); nextImage(); }} aria-label="Next">›</button>
                        <div className="gallery-count">{activeImage + 1} / {safeImages.length}</div>
                    </>
                )}
                <div className="gallery-zoom-hint">🔍 Click to enlarge</div>
            </div>

            {/* THUMBNAILS */}
            {safeImages.length > 1 && (
                <div className="gallery-thumbs">
                    {safeImages.map((img, idx) => (
                        <button
                            key={idx}
                            className={`gallery-thumb${idx === activeImage ? ' gallery-thumb-active' : ''}`}
                            onClick={() => setActiveImage(idx)}
                            aria-label={`View image ${idx + 1}`}
                        >
                            <img
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                onError={(e) => { e.target.src = fallbackImage(type); }}
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* ── LIGHTBOX ── */}
            {lightboxOpen && (
                <div
                    className="lightbox-overlay"
                    onClick={() => setLightboxOpen(false)}
                >
                    <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>✕</button>
                        <img
                            src={safeImages[activeImage]}
                            alt={`${title} — full view`}
                            className="lightbox-img"
                            onError={(e) => { e.target.src = fallbackImage(type); }}
                        />
                        {safeImages.length > 1 && (
                            <>
                                <button className="lightbox-arrow lightbox-arrow-left" onClick={prevImage}>‹</button>
                                <button className="lightbox-arrow lightbox-arrow-right" onClick={nextImage}>›</button>
                                <div className="lightbox-count">{activeImage + 1} / {safeImages.length}</div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default ListingGallery;
