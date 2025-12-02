import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import Ordenes from "./components/Ordenes";
import Dashboard from "./components/Dashboard";
import Productos from "./components/Productos";
import Clientes from "./components/Clientes";   // ✅ AGREGAR

import "./App.css";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/"
          element={
            !user ? (
              <Login onLogin={(userData) => setUser(userData)} />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />

        {/* ÓRDENES */}
        <Route
          path="/ordenes"
          element={
            user ? (
              <Ordenes user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <Dashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* PRODUCTOS */}
        <Route
          path="/productos"
          element={
            user ? (
              <Productos user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* ✅ CLIENTES (NUEVA RUTA) */}
        <Route
          path="/clientes"
          element={
            user ? (
              <Clientes user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* DEFAULT */}
        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/"} />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
