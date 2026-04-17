import React, { useState } from "react";
import { getStoredUser } from "../lib/auth";
import { formatCurrency, useFinanceData } from "../lib/financeStore";

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const ruleOptions = ["Enabled", "Disabled"] as const;
const themeOptions = ["light", "dark"] as const;

const Settings: React.FC = () => {
  const { data, setData } = useFinanceData();
  const user = getStoredUser();
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    baseCurrencyCode: data.settings.baseCurrencyCode,
    budgetReminderDay: data.settings.budgetReminderDay,
    goalContributionRule: data.settings.goalContributionRule,
    alertThreshold: String(data.settings.alertThreshold),
    themeMode: data.settings.themeMode,
    openingCashBalance: String(data.settings.openingCashBalance),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setData((current) => ({
      ...current,
      settings: {
        baseCurrencyCode: form.baseCurrencyCode.toUpperCase(),
        budgetReminderDay: form.budgetReminderDay,
        goalContributionRule: form.goalContributionRule as "Enabled" | "Disabled",
        alertThreshold: Number(form.alertThreshold),
        themeMode: form.themeMode as "light" | "dark",
        openingCashBalance: Number(form.openingCashBalance),
      },
    }));
    setMessage("Settings saved.");
    setTimeout(() => setMessage(null), 1800);
  };

  return (
    <div className="page-width">
      <section className="summary-grid">
        <div className="metric-card">
          <div className="metric-label">Base currency</div>
          <div className="metric-value">{data.settings.baseCurrencyCode}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Reminder day</div>
          <div className="metric-value">{data.settings.budgetReminderDay}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Opening cash</div>
          <div className="metric-value">{formatCurrency(data.settings.openingCashBalance, data.settings.baseCurrencyCode)}</div>
        </div>
      </section>

      <div className="editor-layout">
        <section className="editor-card">
          <div className="page-intro">
            <div className="eyebrow">Settings</div>
            <h1>Edit preferences</h1>
            <p className="muted">Choose how the app looks, when reminders appear, and what cash balance your transaction history should build from.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="settings-currency">Base currency code</label>
              <div className="field-help">Use a 3-letter code like USD, INR, or EUR for totals across the app.</div>
              <input
                id="settings-currency"
                value={form.baseCurrencyCode}
                onChange={(event) => setForm((current) => ({ ...current, baseCurrencyCode: event.target.value }))}
                placeholder="INR"
                maxLength={3}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="settings-openingCash">Opening cash balance</label>
              <div className="field-help">Set the cash amount you had before your saved transactions begin. The app uses this as the starting point for automatic cash tracking.</div>
              <input
                id="settings-openingCash"
                type="number"
                step="0.01"
                value={form.openingCashBalance}
                onChange={(event) => setForm((current) => ({ ...current, openingCashBalance: event.target.value }))}
                required
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Budget reminder day</label>
                <div className="field-help">Pick the day you usually review spending and budgets.</div>
                <div className="choice-row">
                  {weekdays.map((day) => (
                    <button
                      key={day}
                      className={`choice-chip ${form.budgetReminderDay === day ? "is-active" : ""}`}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, budgetReminderDay: day }))}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>Goal contribution rule</label>
                <div className="field-help">Turn this on if you want the app to treat goal saving as an active habit.</div>
                <div className="choice-row">
                  {ruleOptions.map((option) => (
                    <button
                      key={option}
                      className={`choice-chip ${form.goalContributionRule === option ? "is-active" : ""}`}
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          goalContributionRule: option,
                        }))
                      }
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="field">
              <label>Theme mode</label>
              <div className="field-help">Switch between a soft light workspace and a darker night-friendly view.</div>
              <div className="choice-row">
                {themeOptions.map((option) => (
                  <button
                    key={option}
                    className={`choice-chip ${form.themeMode === option ? "is-active" : ""}`}
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        themeMode: option,
                      }))
                    }
                  >
                    {option === "light" ? "Light" : "Dark"}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label htmlFor="settings-threshold">Alert threshold (%)</label>
              <div className="field-help">The app can highlight categories once they reach this share of the budget.</div>
              <input
                id="settings-threshold"
                type="number"
                min="1"
                max="100"
                value={form.alertThreshold}
                onChange={(event) => setForm((current) => ({ ...current, alertThreshold: event.target.value }))}
                required
              />
            </div>
            {message ? <div className="message message-success">{message}</div> : null}
            <button className="button" type="submit">
              Save settings
            </button>
          </form>
        </section>

        <section className="data-card">
          <div className="eyebrow">Current profile</div>
          <h2 style={{ marginTop: 12, marginBottom: 8 }}>Saved preferences</h2>
          <div className="record-list">
            <div className="record-item">
              <div className="record-main">
                <span className="record-title">Signed in user</span>
                <span className="record-subtitle">{user?.email || "Not available"}</span>
              </div>
              <div className="record-value">{user?.firstName || "User"}</div>
            </div>
            <div className="record-item">
              <div className="record-main">
                <span className="record-title">Currency</span>
                <span className="record-subtitle">Used across dashboard totals and records</span>
              </div>
              <div className="record-value">{data.settings.baseCurrencyCode}</div>
            </div>
            <div className="record-item">
              <div className="record-main">
                <span className="record-title">Opening cash balance</span>
                <span className="record-subtitle">Starting point for automatic cash and net worth tracking</span>
              </div>
              <div className="record-value">{formatCurrency(data.settings.openingCashBalance, data.settings.baseCurrencyCode)}</div>
            </div>
            <div className="record-item">
              <div className="record-main">
                <span className="record-title">Budget reminder</span>
                <span className="record-subtitle">Your weekly review day</span>
              </div>
              <div className="record-value">{data.settings.budgetReminderDay}</div>
            </div>
            <div className="record-item">
              <div className="record-main">
                <span className="record-title">Auto contribution</span>
                <span className="record-subtitle">Current goal rule status</span>
              </div>
              <div className="record-value">{data.settings.goalContributionRule}</div>
            </div>
            <div className="record-item">
              <div className="record-main">
                <span className="record-title">Theme</span>
                <span className="record-subtitle">Current visual mode</span>
              </div>
              <div className="record-value">{data.settings.themeMode === "light" ? "Light" : "Dark"}</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
