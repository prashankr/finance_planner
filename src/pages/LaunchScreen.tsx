import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { navItems } from "../lib/appData";
import { isAuthenticated } from "../lib/auth";

const LaunchScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  if (isAuthenticated()) {
    return null;
  }

  return (
    <div className="page-width hero-grid">
      <section className="hero-panel">
        <div className="eyebrow">Money clarity, finally</div>
        <h1 className="hero-title">
          Build a calmer <span>money system</span> you can trust every day.
        </h1>
        <p className="hero-copy">
          Finance Planner gives you one clean place to track spending, set budgets, grow goals, and
          spot problems before they become stress.
        </p>
        <div className="hero-actions">
          <button className="button" onClick={() => navigate("/signup")} type="button">
            Start planning
          </button>
          <button className="button-secondary" onClick={() => navigate("/login")} type="button">
            Sign in
          </button>
        </div>
      </section>

      <section className="hero-metrics">
        <div className="metric-card">
          <div className="metric-label">Your home base</div>
          <div className="metric-value">6 core spaces</div>
          <p className="muted" style={{ marginTop: 10 }}>
            Transactions, budgets, goals, net worth, alerts, and settings in one flow.
          </p>
        </div>
        <div className="metric-card">
          <div className="metric-label">Designed for momentum</div>
          <div className="metric-value">Fast daily check-ins</div>
          <p className="muted" style={{ marginTop: 10 }}>
            Glanceable status cards help you decide what matters right now.
          </p>
        </div>
        {navItems.slice(0, 2).map((item) => (
          <div className="metric-card" key={item.href}>
            <div className="nav-card__icon" style={{ background: item.accentSoft, color: item.accent }}>
              {item.shortLabel}
            </div>
            <strong>{item.label}</strong>
            <p className="muted" style={{ marginTop: 10 }}>
              {item.description}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default LaunchScreen;
