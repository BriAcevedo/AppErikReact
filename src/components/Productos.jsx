import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

export default function Productos() {
  const API = "https://localhost:7075/api/Products";

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    id: "",
    nombre: "",
    descripcion: "",
    unidadMedida: "",
    cantidad: "",
    precio: "",
  });

  const apiRequest = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Error ${response.status}`);
    }

    if (response.status === 204) return null;
    return await response.json();
  };

  const fetchProductos = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest(API);
      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Error al cargar productos: " + err.message);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        unidadMedida: form.unidadMedida,
        cantidad: Number(form.cantidad),
        precio: Number(form.precio),
      };

      if (form.id) {
        await apiRequest(`${API}/${form.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        alert("Producto actualizado");
      } else {
        await apiRequest(`${API}/crear`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        alert("Producto creado");
      }

      resetForm();
      fetchProductos();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p) => {
    setForm({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      unidadMedida: p.unidadMedida,
      cantidad: p.cantidad,
      precio: p.precio,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`¿Eliminar producto ${p.nombre}?`)) return;

    try {
      await apiRequest(`${API}/${p.id}`, { method: "DELETE" });
      alert("Producto eliminado");
      fetchProductos();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const resetForm = () => {
    setForm({
      id: "",
      nombre: "",
      descripcion: "",
      unidadMedida: "",
      cantidad: "",
      precio: "",
    });
  };

  const filtered = productos.filter((p) =>
    (p.nombre || "").toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    fetchProductos();
  }, []);

  return (
    <>
      {/* 🔥🔥🔥 CSS DEFINITIVO: ANCHO COMPLETO SIN SCROLL LATERAL 🔥🔥🔥 */}
      <style>{`
        /* --- AJUSTES GLOBALES CRÍTICOS PARA FORZAR ANCHO Y ELIMINAR SCROLL --- */
        
        *, *::before, *::after {
          box-sizing: border-box;
        }

        body {
            overflow-x: hidden; 
            margin: 0; 
        }

        .page {
          width: 100vw; 
          padding: 40px;
          background: #f3f4f6;
          min-height: 100vh;
        }

        .card {
          background: white;
          padding: 40px;
          width: 100%; 
          max-width: 100%; 
          margin: auto;
          border-radius: 22px;
          box-shadow: 0 10px 35px rgba(0,0,0,0.15);
        }

        .title {
          font-size: 36px;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 20px;
        }

        .search {
          width: 100%;
          padding: 12px 15px;
          border-radius: 12px;
          border: 2px solid #d1d5db;
          margin-bottom: 25px;
          transition: .3s;
          background: #fafafa;
          font-size: 16px;
        }

        .search:focus {
          outline: none;
          border-color: #6366f1;
          background: white;
          box-shadow: 0 0 0 4px #6366f130;
        }

        .section-title {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 15px;
          color: #111827;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr); 
          gap: 15px;
          margin-bottom: 25px;
        }
        
        .form-grid input:nth-child(1), 
        .form-grid input:nth-child(2), 
        .form-grid input:nth-child(3) {
            grid-column: span 2;
        }

        .form-grid button {
            grid-column: span 2;
        }

        .input {
          padding: 13px;
          border-radius: 12px;
          border: 2px solid #d1d5db;
          background: #f8fafc;
          transition: .3s;
          font-size: 15px;
        }

        .input:focus {
          border-color: #764ba2;
          background: white;
          box-shadow: 0 0 0 3px #764ba230;
          outline: none;
        }

        .btn-primary {
          padding: 14px;
          width: 100%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 700;
          font-size: 17px;
          cursor: pointer;
          transition: 0.3s;
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 7px 20px rgba(118,75,162,0.4);
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          overflow: hidden;
          border-radius: 15px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }

        thead {
          background: #4f46e5;
          color: white;
        }

        th, td {
          padding: 14px;
          border-bottom: 1px solid #e5e7eb;
          text-align: center;
        }
        
        td:nth-child(2), td:nth-child(3) { 
            text-align: left;
            padding-left: 20px;
        }

        tr:hover {
          background: #f3f4f6;
        }

        .btn-edit {
          background: #f59e0b;
          border: none;
          padding: 7px 12px;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          transition: .2s;
        }

        .btn-edit:hover {
          background: #d97706;
        }

        .btn-delete {
          background: #ef4444;
          border: none;
          padding: 7px 12px;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          margin-left: 6px;
          transition: .2s;
        }

        .btn-delete:hover {
          background: #b91c1c;
        }

        .price {
          color: #059669;
          font-weight: 700;
        }
      `}</style>

      <div className="page">
        <div className="card">
          <h1 className="title">Gestión de Productos</h1>

          <input
            className="search"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <h2 className="section-title">
            {form.id ? "Editar Producto" : "Crear Producto"}
          </h2>

          <form onSubmit={handleSubmit} className="form-grid">
            <input className="input" placeholder="Nombre" value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })} />

            <input className="input" placeholder="Descripción" value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />

            <input className="input" placeholder="Unidad de medida" value={form.unidadMedida}
              onChange={(e) => setForm({ ...form, unidadMedida: e.target.value })} />

            <input className="input" placeholder="Cantidad" value={form.cantidad}
              onChange={(e) => setForm({ ...form, cantidad: e.target.value })} />

            <input className="input" placeholder="Precio" value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })} />

            <button type="submit" className="btn-primary">
              {form.id ? "Guardar cambios" : "Crear Producto"}
            </button>
          </form>

          <h2 className="section-title">Lista de Productos ({filtered.length})</h2>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Unidad</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.nombre}</td>
                  <td>{p.descripcion}</td>
                  <td>{p.unidadMedida}</td>
                  <td>{p.cantidad}</td>
                  <td className="price">${p.precio}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(p)}>Editar</button>
                    <button className="btn-delete" onClick={() => handleDelete(p)}>Eliminar</button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7">No hay productos para mostrar</td>
                </tr>
              )}
            </tbody>
          </table>

          {loading && <p>Cargando...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </div>
    </>
  );
}
