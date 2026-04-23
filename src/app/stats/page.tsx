import React from "react";

export default function NuclearStats() {
    return (
        <div style={{
            backgroundColor: '#09090b',
            color: 'white',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'sans-serif'
        }}>
            <h1 style={{ fontSize: '4rem', fontWeight: '900', fontStyle: 'italic' }}>STATS IS LIVE</h1>
            <p style={{ color: '#71717a' }}>If you see this, the route is active. Restoring full UI in next step.</p>
        </div>
    );
}
