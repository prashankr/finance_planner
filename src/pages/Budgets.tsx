import React, { useMemo, useState } from "react";
import { createId, formatCurrency, useFinanceData } from "../lib/financeStore";

const emptyForm = { category: "", limit: "", spent: "" };

const Budgets: React.FC = () => {
  const { data, setData } = useFinanceData();
  const currency = data.settings.baseCurrencyCode;
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const totals = useMemo(() => {
    const totalLimit = data.budgets.reduce((sum, item) => sum + item.limit, 0);
    const totalSpent = data.budgets.reduce((sum, item) => sum + item.spent, 0);
    return { totalLimit, totalSpent, left: totalLimit - totalSpent };
  }, [data.budgets]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      id: editingId || createId(),
      category: form.category,
      limit: Number(form.limit),
      spent: Number(form.spent),
    };

    setData((current) => ({
      ...current,
      budgets: editingId
        ? current.budgets.map((entry) => (entry.id === editingId ? payload : entry))
        : [payload, ...current.budgets],
    }));

    resetForm();
  };

  return (
    <div className="page-width">
      <section className="summary-grid">
        <div className="metric-card">
          <div className="metric-label">Planned</div>
          <div className="metric-value">{formatCurrency(totals.totalLimit, currency)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Spent</div>
          <div className="metric-value">{formatCurrency(totals.totalSpent, currency)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Remaining</div>
          <div className="metric-value">{formatCurrency(totals.left, currency)}</div>
        </div>
      </section>

      <div className="editor-layout">
        <section className="editor-card">
          <div className="page-intro">
            <div className="eyebrow">Budgets</div>
            <h1>{editingId ? "Edit budget" : "Create budget"}</h1>
            <p className="muted">Set a spending limit for each category so you can quickly see what is safe, tight, or overspent.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="budget-category">Category</label>
              <div className="field-help">Create one budget per spending area such as Housing, Food, or Travel.</div>
              <input
                id="budget-category"
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                placeholder="Housing, food, travel"
                required
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="budget-limit">Limit</label>
                <div className="field-help">This is the maximum amount you want to spend in that category.</div>
                <input
                  id="budget-limit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.limit}
                  onChange={(event) => setForm((current) => ({ ...current, limit: event.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="budget-spent">Spent so far</label>
                <div className="field-help">Update this with how much has already been used from the budget.</div>
                <input
                  id="budget-spent"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.spent}
                  onChange={(event) => setForm((current) => ({ ...current, spent: event.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="choice-row">
              <button className="button" type="submit">
                {editingId ? "Update budget" : "Save budget"}
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
          <div className="eyebrow">Saved categories</div>
          <h2 style={{ marginTop: 12, marginBottom: 8 }}>Your budgets</h2>
          {data.budgets.length ? (
            <div className="record-list">
              {data.budgets.map((item) => {
                const remaining = item.limit - item.spent;
                const statusClass = remaining >= item.limit * 0.2 ? "trend-up" : remaining > 0 ? "trend-warn" : "trend-down";

                return (
                  <div className="record-item" key={item.id}>
                    <div className="record-main">
                      <span className="record-title">{item.category}</span>
                      <span className="record-subtitle">
                        Spent {formatCurrency(item.spent, currency)} of {formatCurrency(item.limit, currency)}
                      </span>
                    </div>
                    <div className="record-value">
                      <div className={statusClass}>{formatCurrency(remaining, currency)} left</div>
                      <div className="record-actions">
                        <button
                          className="button-ghost"
                          type="button"
                          onClick={() => {
                            setForm({
                              category: item.category,
                              limit: String(item.limit),
                              spent: String(item.spent),
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
                              budgets: current.budgets.filter((entry) => entry.id !== item.id),
                            }))
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-copy">No budgets yet. Add your first category from the form.</div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Budgets;
