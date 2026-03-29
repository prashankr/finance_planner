import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getApiUrl } from "../lib/auth";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      const response = await fetch(getApiUrl("/api/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setErrorMessage(data.error || "Signup failed.");
        setLoading(false);
        return;
      }

      setMessage("Account created successfully.");
      setLoading(false);
      setTimeout(() => navigate("/login"), 1000);
    } catch {
      setErrorMessage("Unable to create your account right now.");
      setLoading(false);
    }
  };

  return (
    <div className="page-width" style={{ display: "flex", justifyContent: "center" }}>
      <div
        className="auth-card"
        style={{
          width: "100%",
          maxWidth: 420,
          padding: 28,
        }}
      >
        <div className="eyebrow">Finance Planner</div>
        <h1 style={{ marginTop: 12, marginBottom: 8 }}>Sign Up</h1>
        <p className="muted" style={{ marginBottom: 22 }}>
          Create your account.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="signup-firstName">First Name</label>
            <input
              id="signup-firstName"
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="First name"
              autoComplete="given-name"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="signup-lastName">Last Name</label>
            <input
              id="signup-lastName"
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              placeholder="Last name"
              autoComplete="family-name"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          {errorMessage ? <div className="message message-error">{errorMessage}</div> : null}
          {message ? <div className="message message-success">{message}</div> : null}

          <button className="button" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 18 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--brand)", fontWeight: 700 }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
