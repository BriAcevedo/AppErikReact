import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Ordenes from "./components/Ordenes";
import Dashboard from "./components/Dashboard";
import Productos from "./components/Productos";
import Clientes from "./components/Clientes";
import TiendaUsuario from "./components/TiendaUsuario";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Ruta principal → Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* ÓRDENES */}
        <Route path="/ordenes" element={<Ordenes />} />

        {/* DASHBOARD */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* PRODUCTOS */}
        <Route path="/productos" element={<Productos />} />

        {/* CLIENTES */}
        <Route path="/clientes" element={<Clientes />} />

         {/* CLIENTES */}
        <Route path="/TiendaUsuario" element={<TiendaUsuario />} />

        {/* DEFAULT */}
        <Route path="*" element={<Navigate to="/dashboard" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
