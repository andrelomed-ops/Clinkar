import React from "react";

export default function OriginalAdminReport() {
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
            <h1 style={{ fontSize: '4rem', fontWeight: '900', fontStyle: 'italic' }}>ADMIN REPORT IS LIVE</h1>
            <p style={{ color: '#71717a' }}>Ruta original detectada. Procediendo a restaurar el sistema.</p>
        </div>
    );
}
