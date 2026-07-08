import React from 'react';

function Footer() {
    return (
        <footer className="site-footer">
            <span className="footer-brand">Marefia Properties</span>
            <span>© {new Date().getFullYear()} All rights reserved.</span>
        </footer>
    );
}

export default Footer;
