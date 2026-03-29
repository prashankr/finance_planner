import React from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  copy: string;
  asideTitle: string;
  asideCopy: string;
  children: React.ReactNode;
};

const AuthShell: React.FC<AuthShellProps> = ({
  eyebrow,
  title,
  copy,
  asideTitle,
  asideCopy,
  children,
}) => {
  return (
    <div className="page-width auth-layout">
      <section className="hero-panel auth-showcase">
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="auth-title" style={{ marginTop: 16 }}>
          {asideTitle}
        </h1>
        <p className="auth-copy" style={{ marginTop: 14 }}>
          {asideCopy}
        </p>
        <div className="mini-grid" style={{ marginTop: 28 }}>
          <div className="metric-card">
            <div className="metric-label">Clear picture</div>
            <div className="metric-value">24/7</div>
            <p className="muted" style={{ marginTop: 10 }}>
              One home for balances, plans, and next actions.
            </p>
          </div>
          <div className="metric-card">
            <div className="metric-label">Built for focus</div>
            <div className="metric-value">6</div>
            <p className="muted" style={{ marginTop: 10 }}>
              Core planning spaces organized around what matters most.
            </p>
          </div>
        </div>
      </section>

      <section className="auth-card">
        <div className="eyebrow">{eyebrow}</div>
        <h2 className="auth-title" style={{ marginTop: 14 }}>
          {title}
        </h2>
        <p className="auth-copy" style={{ marginTop: 12 }}>
          {copy}
        </p>
        {children}
      </section>
    </div>
  );
};

export default AuthShell;
