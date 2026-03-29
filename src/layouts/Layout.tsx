import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearStoredUser, getStoredUser } from "../lib/auth";
import { useFinanceData } from "../lib/financeStore";

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredUser();
  const { data, setData } = useFinanceData();
  const isLoggedIn = Boolean(user);
  const isLandingPage = location.pathname === "/";

  const handleLogout = () => {
    clearStoredUser();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <Link className="brand" to={isLoggedIn ? "/dashboard" : "/"}>
            <div className="brand-copy">
              <span className="eyebrow">Personal finance</span>
              <span className="brand-title">Finance Planner</span>
            </div>
          </Link>

          <nav className="nav-actions">
            {!isLandingPage ? (
              <Link className="button-ghost" to="/dashboard">
                Dashboard
              </Link>
            ) : null}
            <button
              className="button-ghost"
              type="button"
              onClick={() =>
                setData((current) => ({
                  ...current,
                  settings: {
                    ...current.settings,
                    themeMode: current.settings.themeMode === "light" ? "dark" : "light",
                  },
                }))
              }
            >
              {data.settings.themeMode === "light" ? "Dark mode" : "Light mode"}
            </button>
            {isLoggedIn ? (
              <>
                <span className="pill">{user?.firstName || "Member"}</span>
                <button className="button-secondary" onClick={handleLogout} type="button">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link className="button-ghost" to="/login">
                  Login
                </Link>
                <Link className="button" to="/signup">
                  Create account
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="app-main">{children}</main>
    </div>
  );
};

export default RootLayout;
