import React from 'react';


const Alerts: React.FC = () => {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0d1117 0%, #0f1923 50%, #0d1117 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 24,
        padding: "2.5rem 2rem",
        minWidth: 320,
        color: "#e8e6df",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 600, marginBottom: 8 }}>Alerts</h1>
        <p style={{ color: "rgba(232,230,223,0.5)", fontSize: "1rem" }}>In-app notifications.</p>
      </div>
    </div>
  );
};

export default Alerts;
