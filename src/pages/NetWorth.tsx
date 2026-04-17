import React, { useMemo, useState } from "react";
import { buildFinanceSnapshot, createId, formatCurrency, useFinanceData } from "../lib/financeStore";

const itemTypes = ["asset", "liability"] as const;
const emptyForm = { name: "", type: "asset" as (typeof itemTypes)[number], amount: "" };

const NetWorth: React.FC = () => {
  const { data, setData } = useFinanceData();
  const currency = data.settings.baseCurrencyCode;
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const snapshot = useMemo(() => buildFinanceSnapshot(data), [data]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      id: editingId || createId(),
      name: form.name,
      type: form.type,
      amount: Number(form.amount),
    };

    setData((current) => ({
      ...current,
      netWorth: editingId
        ? current.netWorth.map((entry) => (entry.id === editingId ? payload : entry))
        : [payload, ...current.netWorth],
    }));

    resetForm();
  };

  return (
    <div className="page-width">
      <section className="summary-grid">
        <div className="metric-card">
          <div className="metric-label">Cash on hand</div>
          <div className="metric-value">{formatCurrency(snapshot.cashOnHand, currency)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Other assets</div>
          <div className="metric-value">{formatCurrency(snapshot.manualAssets, currency)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Liabilities</div>
          <div className="metric-value">{formatCurrency(snapshot.liabilities, currency)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Net worth</div>
          <div className="metric-value">{formatCurrency(snapshot.netWorth, currency)}</div>
        </div>
      </section>

      <div className="editor-layout">
        <section className="editor-card">
          <div className="page-intro">
            <div className="eyebrow">Net worth</div>
            <h1>{editingId ? "Edit item" : "Add item"}</h1>
            <p className="muted">
              Cash now comes from your opening balance plus transaction history. Add only longer-term assets and debts here so your net worth stays clean.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="networth-name">Name</label>
              <div className="field-help">Examples: Mutual funds, car loan, brokerage account, student loan.</div>
              <input
                id="networth-name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Mutual funds, car loan, brokerage"
                required
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Type</label>
                <div className="field-help">Assets increase net worth. Liabilities reduce it.</div>
                <div className="choice-row">
                  {itemTypes.map((type) => (
                    <button
                      key={type}
                      className={`choice-chip ${form.type === type ? "is-active" : ""}`}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, type }))}
                    >
                      {type === "asset" ? "Asset" : "Liability"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label htmlFor="networth-amount">Amount</label>
                <div className="field-help">Use the current market value or amount still owed.</div>
                <input
                  id="networth-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="choice-row">
              <button className="button" type="submit">
                {editingId ? "Update item" : "Save item"}
              </button>
              {editingId ? (
                <button className="button-secondary" type="button" onClick={resetForm}>
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="data-card">
          <div className="eyebrow">Balance sheet</div>
          <h2 style={{ marginTop: 12, marginBottom: 8 }}>How your net worth is built</h2>
          <div className="record-list">
            <div className="record-item">
              <div className="record-main">
                <span className="record-title">Cash from transactions</span>
                <span className="record-subtitle">
                  Opening balance {formatCurrency(data.settings.openingCashBalance, currency)} plus all income minus all expenses
                </span>
              </div>
              <div className="record-value trend-up">{formatCurrency(snapshot.cashOnHand, currency)}</div>
            </div>
          </div>
          {data.netWorth.length ? (
            <div className="record-list">
              {data.netWorth.map((item) => (
                <div className="record-item" key={item.id}>
                  <div className="record-main">
                    <span className="record-title">{item.name}</span>
                    <span className="record-subtitle">{item.type === "asset" ? "Asset" : "Liability"}</span>
                  </div>
                  <div className="record-value">
                    <div className={item.type === "asset" ? "trend-up" : "trend-down"}>{formatCurrency(item.amount, currency)}</div>
                    <div className="record-actions">
                      <button
                        className="button-ghost"
                        type="button"
                        onClick={() => {
                          setForm({
                            name: item.name,
                            type: item.type,
                            amount: String(item.amount),
                          });
                          setEditingId(item.id);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="button-ghost"
                        type="button"
                        onClick={() =>
                          setData((current) => ({
                            ...current,
                            netWorth: current.netWorth.filter((entry) => entry.id !== item.id),
                          }))
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-copy">No additional assets or liabilities yet. Cash is already tracked automatically from transactions.</div>
          )}
        </section>
      </div>
    </div>
  );
};

export default NetWorth;
