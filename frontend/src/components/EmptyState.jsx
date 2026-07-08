import React from 'react';

function EmptyState({ icon = '📋', title = 'No Data Found', description = 'There are no items to show.', action = null }) {
    return (
        <div className="empty-state" style={{ padding: '60px 24px' }}>
            <div className="empty-icon">{icon}</div>
            <h3>{title}</h3>
            <p>{description}</p>
            {action}
        </div>
    );
}

export default EmptyState;
