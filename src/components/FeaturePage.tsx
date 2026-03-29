import React from "react";

type SummaryCard = {
  label: string;
  value: string;
  note: string;
};

type ListItem = {
  title: string;
  detail: string;
  value: string;
  trend?: "up" | "warn" | "down";
};

type FeaturePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  summary: SummaryCard[];
  primaryTitle: string;
  primaryCopy: string;
  items: ListItem[];
  sidebarTitle: string;
  sidebarCopy: string;
  sidebarPoints: string[];
};

const trendClassMap = {
  up: "trend-up",
  warn: "trend-warn",
  down: "trend-down",
};

const FeaturePage: React.FC<FeaturePageProps> = ({
  eyebrow,
  title,
  description,
  summary,
  primaryTitle,
  primaryCopy,
  items,
  sidebarTitle,
  sidebarCopy,
  sidebarPoints,
}) => {
  return (
    <div className="page-width">
      <section className="hero-panel" style={{ marginBottom: 24 }}>
        <div className="eyebrow">{eyebrow}</div>
        <div className="stack-between" style={{ marginTop: 18 }}>
          <div>
            <h1 className="section-title">{title}</h1>
            <p className="section-copy" style={{ marginTop: 12, maxWidth: 680 }}>
              {description}
            </p>
          </div>
        </div>
        <div className="quick-stats" style={{ marginTop: 28 }}>
          {summary.map((card) => (
            <div className="metric-card" key={card.label}>
              <div className="metric-label">{card.label}</div>
              <div className="metric-value">{card.value}</div>
              <p className="muted" style={{ marginTop: 10 }}>
                {card.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="feature-layout">
        <article className="feature-card">
          <div className="feature-card__header">
            <div>
              <div className="kicker">{primaryTitle}</div>
              <h3 style={{ marginTop: 10 }}>{primaryCopy}</h3>
            </div>
          </div>
          <div className="feature-list">
            {items.map((item) => (
              <div className="feature-list__item" key={`${item.title}-${item.value}`}>
                <div>
                  <strong>{item.title}</strong>
                  <span className="muted">{item.detail}</span>
                </div>
                <strong className={item.trend ? trendClassMap[item.trend] : undefined}>{item.value}</strong>
              </div>
            ))}
          </div>
        </article>

        <aside className="list-grid">
          <div className="list-card">
            <div className="kicker">{sidebarTitle}</div>
            <h3 style={{ marginTop: 10 }}>{sidebarCopy}</h3>
            <div className="pill-row" style={{ marginTop: 18 }}>
              {sidebarPoints.map((point) => (
                <span className="pill" key={point}>
                  {point}
                </span>
              ))}
            </div>
          </div>
          <div className="list-card">
            <div className="kicker">Next step</div>
            <p style={{ marginTop: 12 }}>
              Connect these modules to real API data next and keep the visual structure as your production shell.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default FeaturePage;
