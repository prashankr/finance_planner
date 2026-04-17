import React, { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { navItems } from "../lib/appData";
import { getStoredUser, isAuthenticated } from "../lib/auth";
import { buildFinanceSnapshot, formatCurrency, useFinanceData } from "../lib/financeStore";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = getStoredUser();
  const { data } = useFinanceData();
  const currency = data.settings.baseCurrencyCode;

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  const snapshot = useMemo(() => buildFinanceSnapshot(data), [data]);

  const assetPercent = snapshot.cashOnHand + snapshot.manualAssets + snapshot.liabilities
    ? Math.round(((snapshot.cashOnHand + snapshot.manualAssets) / (snapshot.cashOnHand + snapshot.manualAssets + snapshot.liabilities)) * 100)
    : 0;

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="page-width">
      <section className="hero-panel" style={{ marginBottom: 24 }}>
        <div className="eyebrow">Dashboard overview</div>
        <div className="stack-between" style={{ marginTop: 18 }}>
          <div>
            <h1 className="section-title">
              {user?.firstName ? `${user.firstName}, here is your money week.` : "Your money week."}
            </h1>
            <p className="section-copy" style={{ marginTop: 12, maxWidth: 720 }}>
              Transactions now drive your cash, budgets, and a cleaner net worth view, so the numbers line up without manual double entry.
            </p>
          </div>
          <span className="pill">{currency} workspace</span>
        </div>
        <div className="quick-stats" style={{ marginTop: 28 }}>
          <div className="metric-card">
            <div className="metric-label">Net cash flow</div>
            <div className="metric-value">{formatCurrency(snapshot.cashFlow, currency)}</div>
            <p className="muted" style={{ marginTop: 10 }}>
              {formatCurrency(snapshot.income, currency)} in income and {formatCurrency(snapshot.expenses, currency)} in expenses.
            </p>
          </div>
          <div className="metric-card">
            <div className="metric-label">Budget left</div>
            <div className="metric-value">{formatCurrency(snapshot.budgetLeft, currency)}</div>
            <p className="muted" style={{ marginTop: 10 }}>
              Live spending from {snapshot.budgets.length} categories matched against this month&apos;s transactions.
            </p>
          </div>
        </div>
      </section>

      <section className="dashboard-charts">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="kicker">Budget usage</div>
              <h3 style={{ margin: "8px 0 0" }}>How your top categories are tracking</h3>
            </div>
          </div>
          {snapshot.budgets.length ? (
            <div className="bar-chart">
              {snapshot.budgets.slice(0, 4).map((item) => (
                <div className="bar-row" key={item.id}>
                  <div className="bar-labels">
                    <span>{item.category}</span>
                    <span>{item.percentUsed}%</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${item.percentUsed}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-copy">Add budgets to see your category chart here.</div>
          )}
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="kicker">Wealth mix</div>
              <h3 style={{ margin: "8px 0 0" }}>Cash and assets vs liabilities</h3>
            </div>
          </div>
          <div className="donut-wrap">
            <div
              className="donut-chart"
              style={{
                background: `conic-gradient(var(--brand) 0 ${assetPercent}%, var(--red) ${assetPercent}% 100%)`,
              }}
            >
              <div className="donut-center">
                <strong>{assetPercent}%</strong>
                <span className="muted">assets</span>
              </div>
            </div>
          </div>
          <div className="legend-list">
            <div className="legend-item">
              <span><span className="legend-dot" style={{ background: "var(--brand)" }} />Cash + assets</span>
              <strong>{formatCurrency(snapshot.cashOnHand + snapshot.manualAssets, currency)}</strong>
            </div>
            <div className="legend-item">
              <span><span className="legend-dot" style={{ background: "var(--red)" }} />Liabilities</span>
              <strong>{formatCurrency(snapshot.liabilities, currency)}</strong>
            </div>
            <div className="legend-item">
              <span><span className="legend-dot" style={{ background: "var(--gold)" }} />Goal progress</span>
              <strong>{snapshot.goalProgress}%</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-grid" style={{ marginTop: 24 }}>
        <div className="card-grid">
          {navItems.map((item) => (
            <Link className="feature-card nav-card" key={item.href} to={item.href}>
              <div className="nav-card__icon" style={{ background: item.accentSoft, color: item.accent }}>
                {item.shortLabel}
              </div>
              <h3 className="nav-card__title">{item.label}</h3>
              <p className="nav-card__copy">{item.description}</p>
            </Link>
          ))}
        </div>

        <aside className="list-grid">
          <div className="list-card">
            <div className="kicker">Your current stats</div>
            <div className="feature-list">
              <div className="feature-list__item">
                <div>
                  <strong>Transactions saved</strong>
                  <span className="muted">Income and expense records you added.</span>
                </div>
                <strong className="trend-up">{data.transactions.length}</strong>
              </div>
              <div className="feature-list__item">
                <div>
                  <strong>Net worth</strong>
                  <span className="muted">Cash from transactions plus tracked assets minus debt.</span>
                </div>
                <strong className={snapshot.netWorth >= 0 ? "trend-up" : "trend-down"}>{formatCurrency(snapshot.netWorth, currency)}</strong>
              </div>
              <div className="feature-list__item">
                <div>
                  <strong>Reminder day</strong>
                  <span className="muted">Current setting for budget review.</span>
                </div>
                <strong>{data.settings.budgetReminderDay}</strong>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default Dashboard;
