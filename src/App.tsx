import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import RootLayout from "./layouts/Layout";
import Alerts from "./pages/Alerts";
import Budgets from "./pages/Budgets";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import LaunchScreen from "./pages/LaunchScreen";
import Login from "./pages/Login";
import NetWorth from "./pages/NetWorth";
import Settings from "./pages/Settings";
import Signup from "./pages/Signup";
import Transaction from "./pages/Transaction";

function App() {
  return (
    <Router>
      <RootLayout>
        <Routes>
          <Route element={<LaunchScreen />} path="/" />
          <Route element={<Login />} path="/login" />
          <Route element={<Signup />} path="/signup" />
          <Route element={<Dashboard />} path="/dashboard" />
          <Route element={<Transaction />} path="/transaction" />
          <Route element={<Budgets />} path="/budgets" />
          <Route element={<Goals />} path="/goals" />
          <Route element={<NetWorth />} path="/networth" />
          <Route element={<Alerts />} path="/alerts" />
          <Route element={<Settings />} path="/settings" />
        </Routes>
      </RootLayout>
    </Router>
  );
}

export default App;
