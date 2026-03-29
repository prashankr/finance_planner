import React, { useMemo, useState } from "react";
import { createId, formatCurrency, useFinanceData } from "../lib/financeStore";

const transactionTypes = ["expense", "income"] as const;
const emptyForm = {
  description: "",
  amount: "",
  type: "expense" as (typeof transactionTypes)[number],
  category: "",
  date: "",
};

const Transaction: React.FC = () => {
  const { data, setData } = useFinanceData();
  const currency = data.settings.baseCurrencyCode;
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const totals = useMemo(() => {
    const income = data.transactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
    const expenses = data.transactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [data.transactions]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      id: editingId || createId(),
      description: form.description,
      amount: Number(form.amount),
      type: form.type,
      category: form.category,
      date: form.date,
    };

    setData((current) => ({
      ...current,
      transactions: editingId
        ? current.transactions.map((entry) => (entry.id === editingId ? payload : entry))
        : [payload, ...current.transactions],
    }));

    resetForm();
  };

  return (
    <div className="page-width">
      <section className="summary-grid">
        <div className="metric-card">
          <div className="metric-label">Income</div>
          <div className="metric-value">{formatCurrency(totals.income, currency)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Expenses</div>
          <div className="metric-value">{formatCurrency(totals.expenses, currency)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Balance</div>
          <div className="metric-value">{formatCurrency(totals.balance, currency)}</div>
        </div>
      </section>

      <div className="editor-layout">
        <section className="editor-card">
          <div className="page-intro">
            <div className="eyebrow">Transactions</div>
            <h1>{editingId ? "Edit transaction" : "Add transaction"}</h1>
            <p className="muted">Use this page to record money coming in or going out. New entries appear immediately in your saved list and dashboard totals.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="transaction-description">Description</label>
              <div className="field-help">Give this entry a short name you will recognize later.</div>
              <input
                id="transaction-description"
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Salary, rent, groceries"
                required
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="transaction-amount">Amount</label>
                <div className="field-help">Enter the value without the currency symbol.</div>
                <input
                  id="transaction-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label>Type</label>
                <div className="field-help">Choose Income for money received or Expense for money spent.</div>
                <div className="choice-row">
                  {transactionTypes.map((type) => (
                    <button
                      key={type}
                      className={`choice-chip ${form.type === type ? "is-active" : ""}`}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, type }))}
                    >
                      {type === "expense" ? "Expense" : "Income"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="transaction-category">Category</label>
                <div className="field-help">Examples: Food, Rent, Transport, Salary, Freelance.</div>
                <input
                  id="transaction-category"
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                  placeholder="Food, housing, freelance"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="transaction-date">Date</label>
                <div className="field-help">Use the day the payment happened or is expected to happen.</div>
                <input
                  id="transaction-date"
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="choice-row">
              <button className="button" type="submit">
                {editingId ? "Update transaction" : "Add transaction"}
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
          <div className="eyebrow">Saved records</div>
          <h2 style={{ marginTop: 12, marginBottom: 8 }}>Your transactions</h2>
          {data.transactions.length ? (
            <div className="record-list">
              {data.transactions.map((item) => (
                <div className="record-item" key={item.id}>
                  <div className="record-main">
                    <span className="record-title">{item.description}</span>
                    <span className="record-subtitle">
                      {item.category} · {item.date || "No date"}
                    </span>
                  </div>
                  <div className="record-value">
                    <div className={item.type === "income" ? "trend-up" : "trend-down"}>
                      {item.type === "income" ? "+" : "-"}
                      {formatCurrency(item.amount, currency)}
                    </div>
                    <div className="record-actions">
                      <button
                        className="button-ghost"
                        type="button"
                        onClick={() => {
                          setForm({
                            description: item.description,
                            amount: String(item.amount),
                            type: item.type,
                            category: item.category,
                            date: item.date,
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
                            transactions: current.transactions.filter((entry) => entry.id !== item.id),
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
            <div className="empty-copy">No transactions yet. Add your first one from the form.</div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Transaction;
