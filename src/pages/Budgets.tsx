import React, { useMemo, useState } from "react";
import { buildFinanceSnapshot, createId, formatCurrency, useFinanceData } from "../lib/financeStore";

const emptyForm = { category: "", limit: "" };

const toTitleCase = (value: string) =>
  value.replace(/\w\S*/g, (segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase());

const Budgets: React.FC = () => {
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
      category: form.category.trim(),
      limit: Number(form.limit),
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
          <div className="metric-value">{formatCurrency(snapshot.totalBudgeted, currency)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Spent this month</div>
          <div className="metric-value">{formatCurrency(snapshot.totalBudgetSpent, currency)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Remaining</div>
          <div className="metric-value">{formatCurrency(snapshot.budgetLeft, currency)}</div>
        </div>
      </section>

      <div className="editor-layout">
        <section className="editor-card">
          <div className="page-intro">
            <div className="eyebrow">Budgets</div>
            <h1>{editingId ? "Edit budget" : "Create budget"}</h1>
            <p className="muted">
              Budgets now pull spending from your transactions automatically. You only set the limit, and the app keeps the usage in sync.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="budget-category">Category</label>
              <div className="field-help">Match the category name you use on transactions, like Housing, Food, or Travel.</div>
              <input
                id="budget-category"
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                placeholder="Housing, food, travel"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="budget-limit">Monthly limit</label>
              <div className="field-help">Use a cap you can comfortably maintain. The suggestion below uses your recent spending plus a small buffer.</div>
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
            {snapshot.unbudgetedCategories.length ? (
              <div className="field">
                <label>Quick add from recent spend</label>
                <div className="field-help">These categories already have expenses this month but no budget yet.</div>
                <div className="choice-row">
                  {snapshot.unbudgetedCategories.slice(0, 4).map((item) => (
                    <button
                      key={item.category}
                      className="choice-chip"
                      type="button"
                      onClick={() =>
                        setForm({
                          category: toTitleCase(item.category),
                          limit: String(item.suggestedLimit),
                        })
                      }
                    >
                      {toTitleCase(item.category)} {formatCurrency(item.suggestedLimit, currency)}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
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
          <div className="eyebrow">Live categories</div>
          <h2 style={{ marginTop: 12, marginBottom: 8 }}>Your budgets</h2>
          {snapshot.budgets.length ? (
            <div className="record-list">
              {snapshot.budgets.map((item) => {
                const statusClass = item.remaining >= item.limit * 0.2 ? "trend-up" : item.remaining > 0 ? "trend-warn" : "trend-down";

                return (
                  <div className="record-item" key={item.id}>
                    <div className="record-main">
                      <span className="record-title">{item.category}</span>
                      <span className="record-subtitle">
                        Spent {formatCurrency(item.spent, currency)} of {formatCurrency(item.limit, currency)} this month
                      </span>
                      {item.suggestedLimit ? (
                        <span className="record-subtitle">Suggested limit from recent history: {formatCurrency(item.suggestedLimit, currency)}</span>
                      ) : null}
                    </div>
                    <div className="record-value">
                      <div className={statusClass}>{formatCurrency(item.remaining, currency)} left</div>
                      <div className="record-subtitle" style={{ textAlign: "right" }}>
                        {item.percentUsed}% used
                      </div>
                      <div className="record-actions">
                        {item.suggestedLimit ? (
                          <button
                            className="button-ghost"
                            type="button"
                            onClick={() =>
                              setData((current) => ({
                                ...current,
                                budgets: current.budgets.map((entry) =>
                                  entry.id === item.id ? { ...entry, limit: item.suggestedLimit } : entry
                                ),
                              }))
                            }
                          >
                            Use suggestion
                          </button>
                        ) : null}
                        <button
                          className="button-ghost"
                          type="button"
                          onClick={() => {
                            setForm({
                              category: item.category,
                              limit: String(item.limit),
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
            <div className="empty-copy">No budgets yet. Add one and spending will be tracked automatically from matching transactions.</div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Budgets;
