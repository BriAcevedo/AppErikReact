import { useNavigate } from "react-router-dom";

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("🚪 Logout desde Dashboard...");
    if (onLogout) onLogout();
  };

  /** Estilos auxiliares reutilizables */
  const cardButton = (gradient) => ({
    cursor: "pointer",
    background: `linear-gradient(${gradient})`,
    borderRadius: 22,
    padding: "45px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    boxShadow: "0 18px 40px rgba(0,0,0,0.2)",
    transition: "0.3s",
    fontWeight: 800,
    minHeight: 180,
  });

  const cardText = {
    marginTop: 18,
    marginBottom: 0,
    fontSize: 20,
    textAlign: "center",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "#ffffff",
        padding: "50px 40px",
        fontFamily: "'Inter', sans-serif",
        margin: 0,
        boxSizing: "border-box",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 50,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 34,
              fontWeight: 900,
              color: "#1e3a8a",
            }}
          >
            ⚙️ Panel de control
          </h1>

          <h2
            style={{
              margin: 0,
              marginTop: 8,
              fontSize: 22,
              color: "#3b82f6",
              fontWeight: 800,
            }}
          >
            {user?.firstName || "Mauricio"}
          </h2>
        </div>

        <button
          onClick={handleLogout}
          style={{
            background: "linear-gradient(135deg,#ef4444,#b91c1c)",
            color: "#fff",
            padding: "14px 30px",
            borderRadius: 14,
            border: "none",
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer",
            transition: "0.25s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          🚪 Cerrar sesión
        </button>
      </div>

      {/* GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 30,
          marginBottom: 50,
        }}
      >
        {/* ÓRDENES */}
        <div
          onClick={() => navigate("/ordenes")}
          style={cardButton("135deg, #3b82f6, #1e40af")}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <span style={{ fontSize: 30 }}>📋</span>
          <p style={cardText}>Gestión de Órdenes</p>
        </div>

        {/* PRODUCTOS */}
        <div
          onClick={() => navigate("/productos")}
          style={cardButton("135deg, #10b981, #047857")}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <span style={{ fontSize: 30 }}>🛒</span>
          <p style={cardText}>Gestión de Productos</p>
        </div>

        {/* PRODUCTOS CLIENTES */}
        <div
          onClick={() => navigate("/clientes")}
          style={cardButton("135deg, #8b5cf6, #6d28d9")}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <span style={{ fontSize: 30 }}>👥</span>
          <p style={cardText}>Productos Clientes</p>
        </div>


        {/* PRODUCTOS TIENDA */}
        <div
          onClick={() => navigate("/TiendaUsuario")}
          style={cardButton("135deg, #8b5cf6, #6d28d9")}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <span style={{ fontSize: 30 }}>🏬</span>
          <p style={cardText}>Productos Tienda</p>
        </div>

      </div>

      {/* FOOTER */}
      <div
        style={{
          textAlign: "center",
          background: "#f8fafc",
          borderRadius: 16,
          padding: 30,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 600,
            color: "#334155",
          }}
        >
          Selecciona una opción para administrar tu aplicación.
        </p>
      </div>
    </div>
  );
}