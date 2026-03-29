import React, { useMemo, useState } from "react";
import { createId, formatCurrency, useFinanceData } from "../lib/financeStore";

const emptyForm = { name: "", target: "", saved: "", dueDate: "" };

const Goals: React.FC = () => {
  const { data, setData } = useFinanceData();
  const currency = data.settings.baseCurrencyCode;
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const totals = useMemo(() => {
    const target = data.goals.reduce((sum, item) => sum + item.target, 0);
    const saved = data.goals.reduce((sum, item) => sum + item.saved, 0);
    return { target, saved, progress: target ? Math.round((saved / target) * 100) : 0 };
  }, [data.goals]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      id: editingId || createId(),
      name: form.name,
      target: Number(form.target),
      saved: Number(form.saved),
      dueDate: form.dueDate,
    };

    setData((current) => ({
      ...current,
      goals: editingId ? current.goals.map((entry) => (entry.id === editingId ? payload : entry)) : [payload, ...current.goals],
    }));

    resetForm();
  };

  return (
    <div className="page-width">
      <section className="summary-grid">
        <div className="metric-card">
          <div className="metric-label">Goal target</div>
          <div className="metric-value">{formatCurrency(totals.target, currency)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Saved</div>
          <div className="metric-value">{formatCurrency(totals.saved, currency)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Progress</div>
          <div className="metric-value">{totals.progress}%</div>
        </div>
      </section>

      <div className="editor-layout">
        <section className="editor-card">
          <div className="page-intro">
            <div className="eyebrow">Goals</div>
            <h1>{editingId ? "Edit goal" : "Add goal"}</h1>
            <p className="muted">Create savings goals with a target amount and due date so you always know how far along you are.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="goal-name">Goal name</label>
              <div className="field-help">Pick a name that clearly describes what you are saving for.</div>
              <input
                id="goal-name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Emergency fund, trip, laptop"
                required
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="goal-target">Target amount</label>
                <div className="field-help">The full amount you want to reach by the deadline.</div>
                <input
                  id="goal-target"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.target}
                  onChange={(event) => setForm((current) => ({ ...current, target: event.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="goal-saved">Saved so far</label>
                <div className="field-help">Enter how much you have already set aside.</div>
                <input
                  id="goal-saved"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.saved}
                  onChange={(event) => setForm((current) => ({ ...current, saved: event.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="goal-dueDate">Target date</label>
              <div className="field-help">Choose when you want to complete this goal.</div>
              <input
                id="goal-dueDate"
                type="date"
                value={form.dueDate}
                onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
                required
              />
            </div>
            <div className="choice-row">
              <button className="button" type="submit">
                {editingId ? "Update goal" : "Save goal"}
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
          <div className="eyebrow">Saved goals</div>
          <h2 style={{ marginTop: 12, marginBottom: 8 }}>Your goals</h2>
          {data.goals.length ? (
            <div className="record-list">
              {data.goals.map((item) => {
                const progress = item.target ? Math.round((item.saved / item.target) * 100) : 0;
                return (
                  <div className="record-item" key={item.id}>
                    <div className="record-main">
                      <span className="record-title">{item.name}</span>
                      <span className="record-subtitle">
                        {formatCurrency(item.saved, currency)} of {formatCurrency(item.target, currency)} · due {item.dueDate}
                      </span>
                    </div>
                    <div className="record-value">
                      <div className={progress >= 60 ? "trend-up" : "trend-warn"}>{progress}%</div>
                      <div className="record-actions">
                        <button
                          className="button-ghost"
                          type="button"
                          onClick={() => {
                            setForm({
                              name: item.name,
                              target: String(item.target),
                              saved: String(item.saved),
                              dueDate: item.dueDate,
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
                              goals: current.goals.filter((entry) => entry.id !== item.id),
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
            <div className="empty-copy">No goals yet. Add one from the form to start tracking progress.</div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Goals;
