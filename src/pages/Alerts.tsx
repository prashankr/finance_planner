import React, { useMemo, useState } from "react";
import { createId, useFinanceData } from "../lib/financeStore";

const alertTypes = ["Budget", "Bill", "Goal", "General"] as const;
const emptyForm = {
  title: "",
  detail: "",
  type: "Budget" as (typeof alertTypes)[number],
};

const Alerts: React.FC = () => {
  const { data, setData } = useFinanceData();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const totals = useMemo(() => {
    const active = data.alerts.filter((item) => item.status === "Active").length;
    const resolved = data.alerts.filter((item) => item.status === "Resolved").length;
    return { active, resolved, total: data.alerts.length };
  }, [data.alerts]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const existing = data.alerts.find((item) => item.id === editingId);
    const payload = {
      id: editingId || createId(),
      title: form.title,
      detail: form.detail,
      type: form.type,
      status: existing?.status || "Active",
    };

    setData((current) => ({
      ...current,
      alerts: editingId ? current.alerts.map((entry) => (entry.id === editingId ? payload : entry)) : [payload, ...current.alerts],
    }));

    resetForm();
  };

  return (
    <div className="page-width">
      <section className="summary-grid">
        <div className="metric-card">
          <div className="metric-label">Total alerts</div>
          <div className="metric-value">{totals.total}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Active</div>
          <div className="metric-value">{totals.active}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Resolved</div>
          <div className="metric-value">{totals.resolved}</div>
        </div>
      </section>

      <div className="editor-layout">
        <section className="editor-card">
          <div className="page-intro">
            <div className="eyebrow">Alerts</div>
            <h1>{editingId ? "Edit alert" : "Create alert"}</h1>
            <p className="muted">Create reminders for bills, goals, or budget pressure. You can mark them resolved once the task is handled.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="alert-title">Title</label>
              <div className="field-help">Write a short headline so the alert is easy to scan later.</div>
              <input
                id="alert-title"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Rent due tomorrow"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="alert-detail">Details</label>
              <div className="field-help">Add the reason or action you want to remember.</div>
              <textarea
                id="alert-detail"
                value={form.detail}
                onChange={(event) => setForm((current) => ({ ...current, detail: event.target.value }))}
                placeholder="Add a short note about what needs attention"
                required
              />
            </div>
            <div className="field">
              <label>Alert type</label>
              <div className="field-help">Choose the category that best matches this reminder.</div>
              <div className="choice-row">
                {alertTypes.map((type) => (
                  <button
                    key={type}
                    className={`choice-chip ${form.type === type ? "is-active" : ""}`}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, type }))}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="choice-row">
              <button className="button" type="submit">
                {editingId ? "Update alert" : "Add alert"}
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
          <div className="eyebrow">Saved alerts</div>
          <h2 style={{ marginTop: 12, marginBottom: 8 }}>Your alert list</h2>
          {data.alerts.length ? (
            <div className="record-list">
              {data.alerts.map((item) => (
                <div className="record-item" key={item.id}>
                  <div className="record-main">
                    <span className="record-title">{item.title}</span>
                    <span className="record-subtitle">
                      {item.type} · {item.detail}
                    </span>
                  </div>
                  <div className="record-value">
                    <div className={item.status === "Active" ? "trend-warn" : "trend-up"}>{item.status}</div>
                    <div className="record-actions">
                      <button
                        className="button-ghost"
                        type="button"
                        onClick={() => {
                          setForm({
                            title: item.title,
                            detail: item.detail,
                            type: item.type,
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
                            alerts: current.alerts.map((entry) =>
                              entry.id === item.id ? { ...entry, status: entry.status === "Active" ? "Resolved" : "Active" } : entry
                            ),
                          }))
                        }
                      >
                        {item.status === "Active" ? "Resolve" : "Reopen"}
                      </button>
                      <button
                        className="button-ghost"
                        type="button"
                        onClick={() =>
                          setData((current) => ({
                            ...current,
                            alerts: current.alerts.filter((entry) => entry.id !== item.id),
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
            <div className="empty-copy">No alerts yet. Add one and manage it from this page.</div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Alerts;
