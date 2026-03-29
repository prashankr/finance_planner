import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getApiUrl, setStoredUser } from "../lib/auth";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(getApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok || !data.user) {
        setErrorMessage(data.error || "Invalid email or password.");
        setLoading(false);
        return;
      }

      setStoredUser(data.user);
      navigate("/dashboard");
    } catch {
      setErrorMessage("Unable to reach the server right now.");
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
        <h1 style={{ marginTop: 12, marginBottom: 8 }}>Login</h1>
        <p className="muted" style={{ marginBottom: 22 }}>
          Sign in to continue.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
          </div>

          {errorMessage ? <div className="message message-error">{errorMessage}</div> : null}

          <button className="button" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 18 }}>
          Don&apos;t have an account?{" "}
          <Link to="/signup" style={{ color: "var(--brand)", fontWeight: 700 }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
