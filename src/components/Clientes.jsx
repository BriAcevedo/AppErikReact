import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Clientes() {
  const navigate = useNavigate();

  const [estadisticas, setEstadisticas] = useState(null);
  const [ordenes, setOrdenes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ordenesCompletas, setOrdenesCompletas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("estadisticas");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);

    try {
      const URL_BASE = "http://localhost:5155/api/Ordenes";
      
      const [statsRes, ordenesRes, productosRes, completoRes] = await Promise.all([
        fetch(`${URL_BASE}/estadisticas`),
        fetch(URL_BASE),
        fetch(`${URL_BASE}/productos`),
        fetch(`${URL_BASE}/completo`),
      ]);

      if (!statsRes.ok) throw new Error(`Error estadísticas: ${statsRes.status}`);
      if (!ordenesRes.ok) throw new Error(`Error órdenes: ${ordenesRes.status}`);
      if (!productosRes.ok) throw new Error(`Error productos: ${productosRes.status}`);
      if (!completoRes.ok) throw new Error(`Error completo: ${completoRes.status}`);

      const statsData = await statsRes.json();
      const ordenesData = await ordenesRes.json();
      const productosData = await productosRes.json();
      const completoData = await completoRes.json();

      console.log("✅ Datos recibidos de la API");
      console.log("📊 Estadísticas completas:", statsData);
      console.log("📋 Órdenes completas:", ordenesData);
      console.log("🛒 Productos completos:", productosData);
      console.log("📦 Completo completo:", completoData);

      // Extraer solo los datos internos (tu API envuelve todo en {success, data})
      const estadisticasExtraidas = statsData?.data || statsData;
      const ordenesExtraidas = ordenesData?.data || [];
      const productosExtraidos = productosData?.data || [];
      const completoExtraido = completoData?.data || [];

      console.log("🔧 Datos extraídos:");
      console.log("📊 Estadísticas:", estadisticasExtraidas);
      console.log("📋 Órdenes array:", ordenesExtraidas);
      console.log("🛒 Productos array:", productosExtraidos);
      console.log("📦 Completo array:", completoExtraido);

      setEstadisticas(estadisticasExtraidas);
      setOrdenes(Array.isArray(ordenesExtraidas) ? ordenesExtraidas : []);
      setProductos(Array.isArray(productosExtraidos) ? productosExtraidos : []);
      setOrdenesCompletas(Array.isArray(completoExtraido) ? completoExtraido : []);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48 }}>⏳</div>
          <p style={{ fontSize: 18, color: "#64748b", marginTop: 20 }}>Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ textAlign: "center", background: "#fff", padding: 40, borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <p style={{ fontSize: 18, color: "#ef4444", marginTop: 20 }}>{error}</p>
          <button onClick={cargarDatos} style={{ marginTop: 20, padding: "12px 24px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const renderTable = (data, title) => {
    // Validar que data existe y es un array
    if (!data || !Array.isArray(data) || data.length === 0) {
      return (
        <div style={{ background: "#fff", borderRadius: 16, padding: 30, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1e293b", marginBottom: 25 }}>
            {title} (0)
          </h2>
          <p style={{ textAlign: "center", color: "#64748b", padding: 40 }}>
            No hay datos disponibles
          </p>
        </div>
      );
    }

    // Función para aplanar objetos anidados
    const flattenObject = (obj, prefix = '') => {
      const flattened = {};
      
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          // Si es un objeto, aplanarlo recursivamente
          Object.assign(flattened, flattenObject(value, newKey));
        } else if (Array.isArray(value)) {
          // Si es un array de productos, mostrar los nombres
          if (key === 'productos' && value.length > 0 && value[0].nombre) {
            flattened[newKey] = value.map(p => p.nombre).join(', ');
          } else {
            // Para otros arrays, mostrar el conteo
            flattened[newKey] = `[${value.length} items]`;
          }
        } else {
          // Si es un valor simple, agregarlo directamente
          flattened[newKey] = value;
        }
      });
      
      return flattened;
    };

    // Aplanar todos los objetos del array
    const flattenedData = data.map(item => flattenObject(item));

    return (
      <div style={{ background: "#fff", borderRadius: 16, padding: 30, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1e293b", marginBottom: 25 }}>
          {title} ({data.length})
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {Object.keys(flattenedData[0]).map((key, i) => (
                  <th key={i} style={{ background: "#f1f5f9", padding: 14, textAlign: "left", fontWeight: 700, color: "#334155", fontSize: 14, borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap" }}>
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {flattenedData.map((item, i) => (
                <tr key={i}>
                  {Object.values(item).map((value, j) => (
                    <td key={j} style={{ padding: 14, borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: 14 }}>
                      {value === null || value === undefined 
                        ? "-" 
                        : typeof value === 'boolean'
                        ? (value ? "✓" : "✗")
                        : String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "estadisticas":
        return (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1e293b", marginBottom: 25 }}>📊 Estadísticas Generales</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
              {estadisticas && Object.keys(estadisticas).map((key, i) => (
                <div key={i} style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", borderRadius: 12, padding: 25, color: "#fff", textAlign: "center", minHeight: 120, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <p style={{ fontSize: 36, fontWeight: 900, margin: 0 }}>
                    {typeof estadisticas[key] === 'object' 
                      ? JSON.stringify(estadisticas[key]) 
                      : String(estadisticas[key] ?? '-')}
                  </p>
                  <p style={{ fontSize: 14, fontWeight: 600, marginTop: 8, opacity: 0.9 }}>
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      case "ordenes":
        return renderTable(ordenes, "📋 Listado de Órdenes");
      case "productos":
        return renderTable(productos, "🛒 Listado de Productos");
      case "completo":
        return renderTable(ordenesCompletas, "📦 Órdenes Completas");
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", width: "100vw", background: "#f8fafc", padding: 40, fontFamily: "'Inter', sans-serif", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: "#1e3a8a" }}>👥 Productos Clientes</h1>
        <button onClick={() => navigate("/dashboard")} style={{ background: "linear-gradient(135deg, #64748b, #475569)", color: "#fff", padding: "12px 24px", borderRadius: 12, border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer", transition: "0.25s" }}>
          ← Volver al Dashboard
        </button>
      </div>

      <div style={{ display: "flex", gap: 15, marginBottom: 30, borderBottom: "2px solid #e2e8f0", paddingBottom: 10 }}>
        {["estadisticas", "ordenes", "productos", "completo"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "12px 24px", background: activeTab === tab ? "linear-gradient(135deg, #8b5cf6, #6d28d9)" : "#fff", color: activeTab === tab ? "#fff" : "#64748b", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer", transition: "0.3s", boxShadow: activeTab === tab ? "0 4px 15px rgba(139, 92, 246, 0.3)" : "none" }}>
            {tab === "estadisticas" && "📊 Estadísticas"}
            {tab === "ordenes" && "📋 Órdenes"}
            {tab === "productos" && "🛒 Productos"}
            {tab === "completo" && "📦 Completo"}
          </button>
        ))}
      </div>

      {renderContent()}
    </div>
  );
}