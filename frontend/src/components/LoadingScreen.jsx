import React from 'react';

function LoadingScreen({ text = 'Loading...' }) {
    return (
        <div className="loading-screen" style={{ minHeight: '300px' }}>
            <div className="spinner"></div>
            <p className="loading-text">{text}</p>
        </div>
    );
}

export default LoadingScreen;
