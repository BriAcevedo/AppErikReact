import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

export default function Ordenes({ user: initialUser, onLogout }) {
  const [user] = useState(initialUser);
  const [searchUser, setSearchUser] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    id: "",
    userName: user?.firstName?.toLowerCase() || "",
    totalPrice: 0,
    firstName: "",
    lastName: "",
    emailAddress: "",
    addressLine: "",
    country: "",
    state: "",
    zipCode: "",
    cardName: "",
    cardNumber: "",
    expiration: "",
    cvv: "",
    paymentMethod: 1,
  });

  // LÓGICA DEL EASTER EGG (SIN CAMBIOS)
  const [konamiSequence, setKonamiSequence] = useState([]);
  const [easterEggActive, setEasterEggActive] = useState(false);
  const [rabbitAnimation, setRabbitAnimation] = useState(false);

  const secretCode = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];

  useEffect(() => {
    const handleKeyPress = (e) => {
      const newSequence = [...konamiSequence, e.key].slice(-10);
      setKonamiSequence(newSequence);

      if (newSequence.join(",") === secretCode.join(",")) {
        activateEasterEgg();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [konamiSequence]);

  const activateEasterEgg = () => {
    setEasterEggActive(true);
    setRabbitAnimation(true);

    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"];
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        createConfetti(colors[Math.floor(Math.random() * colors.length)]);
      }, i * 30);
    }

    setTimeout(() => {
      setRabbitAnimation(false);
      alert(
        "🎉 ¡MODO DIOS ACTIVADO! 🐰\n\n✨ Has desbloqueado el poder del conejo supremo de RabbitMQ!\n\n🚀 Todas tus órdenes ahora viajarán a la velocidad de la luz\n💫 Los bugs huyen despavoridos\n🎯 El código funciona a la primera\n\n...o al menos eso esperamos 😅"
      );
    }, 2000);
  };

  const createConfetti = (color) => {
    const confetti = document.createElement("div");
    confetti.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: ${color};
      left: ${Math.random() * 100}%;
      top: -10px;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      animation: fall ${2 + Math.random() * 3}s linear forwards;
    `;
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 5000);
  };

  // LÓGICA DE API (SIN CAMBIOS)
  const apiRequest = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    try {
      return await response.json();
    } catch {
      return null;
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const userName = user?.firstName?.toLowerCase();
      if (!userName) {
        setOrders([]);
        return;
      }

      console.log("📥 Obteniendo órdenes para:", userName);

      const data = await apiRequest(
        `http://localhost:30928/api/v1/Order/${encodeURIComponent(userName)}`
      );

      console.log("📦 Datos recibidos del API:", data);

      const ordersList = Array.isArray(data) ? data : data ? [data] : [];

      console.log("📋 Lista de órdenes procesada:", ordersList);

      if (ordersList.length > 0) {
        console.log("📋 Primera orden:", ordersList[0]);
        console.log("✅ ID de primera orden:", ordersList[0].id);
      }

      setOrders(ordersList);
    } catch (err) {
      console.error("❌ Error al cargar órdenes:", err);
      setError("Error al cargar órdenes: " + err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchUser.trim()) {
      fetchOrders();
      return;
    }
    setLoading(true);
    setError("");
    try {
      const uname = searchUser.trim().toLowerCase();
      const data = await apiRequest(
        `http://localhost:30928/api/v1/Order/${encodeURIComponent(uname)}`
      );
      const ordersList = Array.isArray(data) ? data : data ? [data] : [];
      setOrders(ordersList);
    } catch (err) {
      console.error("❌ Error al buscar:", err);
      setError("No se encontraron órdenes para este usuario");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...form,
        id: form.id ? Number(form.id) : 0,
        totalPrice: Number(form.totalPrice) || 0,
        paymentMethod: Number(form.paymentMethod) || 1,
      };

      console.log("📤 Payload a enviar:", payload);

      if (payload.id && payload.id > 0) {
        console.log("🔧 Editando orden con ID:", payload.id);

        await apiRequest("http://localhost:30928/api/v1/Order", {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        console.log("✅ Orden editada exitosamente");
        alert("✅ Orden editada correctamente");
      } else {
        console.log("🆕 Creando nueva orden...");
        const { id, ...newOrder } = payload;

        await apiRequest("http://localhost:30928/api/v1/Order", {
          method: "POST",
          body: JSON.stringify(newOrder),
        });
        console.log("✅ Orden creada exitosamente");
        alert("✅ Orden creada correctamente");
      }

      await fetchOrders();
      resetForm();
    } catch (err) {
      console.error("❌ Error al guardar la orden:", err);
      const errorMsg = err.message || "Error al guardar la orden";
      setError(errorMsg);
      alert(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendToRabbitMQ = async (order) => {
    console.log("🐰 Enviando orden a RabbitMQ:", order);

    const orderId = order.id || order.Id || order.ID;

    if (
      !window.confirm(`¿Deseas enviar la orden #${orderId} a RabbitMQ?`)
    ) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      console.log(
        "🔄 Llamando POST a: http://localhost:30928/api/v1/Order/send"
      );

      const response = await apiRequest(
        "http://localhost:30928/api/v1/Order/send",
        {
          method: "POST",
          body: JSON.stringify(order),
        }
      );

      console.log("✅ Respuesta de RabbitMQ:", response);
      alert("🐰✅ Orden enviada a RabbitMQ correctamente");
    } catch (err) {
      console.error("❌ Error al enviar a RabbitMQ:", err);
      const errorMsg = err.message || "Error al enviar a RabbitMQ";
      setError(errorMsg);
      alert(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orderToDelete) => {
    console.log("🗑️ Intentando eliminar orden:", orderToDelete);

    const id = orderToDelete.id || orderToDelete.Id || orderToDelete.ID;

    console.log("🆔 ID extraído:", id);

    const orderId = Number(id);

    if (!orderId || isNaN(orderId) || orderId <= 0) {
      console.error("❌ ID de orden inválido:", id);
      alert("⚠️ Error: ID de orden inválido");
      return;
    }

    if (!window.confirm(`¿Seguro que deseas eliminar la orden #${orderId}?`)) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      console.log(
        `🔄 Llamando DELETE a: http://localhost:30928/api/v1/Order/${orderId}`
      );

      await apiRequest(`http://localhost:30928/api/v1/Order/${orderId}`, {
        method: "DELETE",
      });

      console.log("✅ Orden eliminada exitosamente");
      alert("🗑️ Orden eliminada correctamente");
      await fetchOrders();
    } catch (err) {
      console.error("❌ Error al eliminar:", err);
      const errorMsg = err.message || "Error al eliminar la orden";
      setError(errorMsg);
      alert(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (order) => {
    console.log("📝 Editando orden:", order);
    const orderId = order.id || order.Id || order.ID || "";
    console.log("🆔 ID capturado:", orderId);

    setForm({
      id: String(orderId),
      userName: order.userName || order.UserName || "",
      totalPrice: order.totalPrice || order.TotalPrice || 0,
      firstName: order.firstName || order.FirstName || "",
      lastName: order.lastName || order.LastName || "",
      emailAddress: order.emailAddress || order.EmailAddress || "",
      addressLine: order.addressLine || order.AddressLine || "",
      country: order.country || order.Country || "",
      state: order.state || order.State || "",
      zipCode: order.zipCode || order.ZipCode || "",
      cardName: order.cardName || order.CardName || "",
      cardNumber: order.cardNumber || order.CardNumber || "",
      expiration: order.expiration || order.Expiration || "",
      cvv: order.cvv || order.CVV || "",
      paymentMethod: order.paymentMethod || order.PaymentMethod || 1,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm({
      id: "",
      userName: user?.firstName?.toLowerCase() || "",
      totalPrice: 0,
      firstName: "",
      lastName: "",
      emailAddress: "",
      addressLine: "",
      country: "",
      state: "",
      zipCode: "",
      cardName: "",
      cardNumber: "",
      expiration: "",
      cvv: "",
      paymentMethod: 1,
    });
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  // FUNCIÓN DE VALIDACIÓN PARA CAMPOS NUMÉRICOS
  const handleNumericChange = (e, field) => {
    const value = e.target.value;
    // Solo permitir números y un punto decimal (para totalPrice)
    if (field === "totalPrice") {
      if (/^\d*\.?\d*$/.test(value) || value === "") {
        setForm({ ...form, [field]: value });
      }
    } else {
      // Solo permitir números enteros (para paymentMethod)
      if (/^\d*$/.test(value) || value === "") {
        setForm({ ...form, [field]: value });
      }
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%", /* Cambiado a 100% para evitar scroll horizontal inicial del div */
        background: "linear-gradient(135deg, #0f172a 0%, #1e40af 100%)", /* Azul Oscuro (Navy Blue) a Medio */
        padding: 0,
        margin: 0,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: "auto",
        overflowX: "hidden", /* **FIX SCROLL HORIZONTAL** */
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
        
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }
        
        @keyframes rainbow {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        
        .easter-egg-active * {
          animation: rainbow 3s linear infinite;
        }
        
        .rabbit-bounce {
          animation: bounce 0.5s ease-in-out infinite;
        }

        input:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
        }
        
        /* Ocultar flechas en inputs de tipo number (aunque ya usamos text con validación) */
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }

        /* Scrollbar estilizado */
        ::-webkit-scrollbar {
          width: 10px;
        }
        ::-webkit-scrollbar-track {
          background: #e0e7ff;
        }
        ::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 5px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #1e40af;
        }
      `}</style>

      {rabbitAnimation && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            pointerEvents: "none",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(5px)",
          }}
        >
          <div className="rabbit-bounce" style={{ fontSize: "150px" }}>
            🐰
          </div>
        </div>
      )}

      <div
        className={easterEggActive ? "easter-egg-active" : ""}
        style={{
          width: "100%",
          minHeight: "100vh",
          padding: "30px",
          display: "flex",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        {/* Contenedor Principal (Tarjetas y Layout) */}
        <div
          style={{
            width: "100%",
            maxWidth: "1400px",
            margin: "0",
            background: "#ffffff",
            borderRadius: "20px",
            padding: "40px",
            boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
            minHeight: "calc(100vh - 60px)",
            boxSizing: "border-box",
          }}
        >
          {/* Encabezado */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "40px",
              paddingBottom: "20px",
              borderBottom: "4px solid #3b82f6",
            }}
          >
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: "900",
                color: "#0f172a",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "15px",
              }}
            >
              <span style={{ fontSize: "1.5em", lineHeight: 1, color: "#3b82f6" }}>
                ⚙️
              </span>
              <span>Gestión de Órdenes</span>
              <span
                style={{
                  color: "#1e40af",
                  fontWeight: "900", /* Se hizo más grueso */
                  fontSize: "2.2rem", /* Se hizo un poco más grande */
                  borderLeft: "3px solid #60a5fa", /* Línea de separación para destacar */
                  paddingLeft: "15px",
                }}
              >
                {user?.firstName ?? "Usuario"}
              </span>
            </h1>
            <button
              onClick={handleLogout}
              style={{
                background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                color: "white",
                padding: "12px 25px",
                borderRadius: "50px",
                border: "none",
                fontSize: "16px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 6px 15px rgba(239, 68, 68, 0.4)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px) scale(1.02)";
                e.target.style.boxShadow =
                  "0 8px 20px rgba(239, 68, 68, 0.6)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0) scale(1)";
                e.target.style.boxShadow =
                  "0 6px 15px rgba(239, 68, 68, 0.4)";
              }}
            >
              🚪 Cerrar sesión
            </button>
          </div>

          {error && (
            <div
              style={{
                background: "#fef2f2",
                color: "#b91c1c",
                padding: "20px",
                borderRadius: "12px",
                marginBottom: "30px",
                border: "2px solid #ef4444",
                fontWeight: "600",
              }}
            >
              <strong>⚠️ Alerta de Sistema:</strong> {error}
            </div>
          )}

          {/* Buscador y Acciones Principales */}
          <div
            style={{
              display: "flex",
              gap: "15px",
              marginBottom: "40px",
              padding: "20px",
              background: "#f1f5f9",
              borderRadius: "15px",
              boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
            }}
          >
            <input
              type="text"
              placeholder="🔍 Buscar órdenes por username (ej: brisa)"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              style={{
                flex: 1,
                padding: "16px 20px",
                fontSize: "17px",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                outline: "none",
                transition: "border-color 0.3s, box-shadow 0.3s",
              }}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                color: "white",
                padding: "16px 30px",
                borderRadius: "10px",
                border: "none",
                fontSize: "17px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 4px 10px rgba(59, 130, 246, 0.4)",
                transition: "opacity 0.3s, transform 0.2s",
              }}
            >
              {loading ? "🔄 Buscando..." : "🔍 Buscar"}
            </button>
            <button
              onClick={fetchOrders}
              disabled={loading}
              style={{
                background: "#475569",
                color: "white",
                padding: "16px 25px",
                borderRadius: "10px",
                border: "none",
                fontSize: "17px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "opacity 0.3s, background 0.2s",
              }}
            >
              🔄 Recargar
            </button>
          </div>

          {/* Formulario */}
          <div
            style={{
              background: "#f8fafc",
              padding: "40px",
              borderRadius: "20px",
              marginBottom: "40px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              border: "1px solid #e2e8f0",
            }}
          >
            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: "800",
                color: "#3b82f6",
                marginBottom: "30px",
                paddingBottom: "10px",
                borderBottom: "2px dashed #93c5fd",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ fontSize: "1.2em" }}>{form.id ? "📝" : "➕"}</span>{" "}
              {form.id
                ? "Edición de Orden ID: " + form.id
                : "Creación de Nueva Orden"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(250px, 1fr))", /* Ajuste para evitar desbordamiento */
                  gap: "20px",
                  marginBottom: "40px",
                }}
              >
                {/* INICIO DE CAMPOS CON ETIQUETAS EXTERNAS */}
                
                {/* Username */}
                <div style={formGroupStyle}>
                  <label htmlFor="userName">Username</label>
                  <input
                    id="userName"
                    placeholder="Username"
                    value={form.userName}
                    onChange={(e) => setForm({ ...form, userName: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>

                {/* Total Price */}
                <div style={formGroupStyle}>
                  <label htmlFor="totalPrice">Total Price ($)</label>
                  <input
                    id="totalPrice"
                    placeholder="Total Price ($)"
                    value={form.totalPrice}
                    onChange={(e) => handleNumericChange(e, "totalPrice")}
                    style={inputStyle}
                    inputMode="decimal"
                    required
                  />
                </div>

                {/* First Name */}
                <div style={formGroupStyle}>
                  <label htmlFor="firstName">First Name</label>
                  <input
                    id="firstName"
                    placeholder="First Name"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>

                {/* Last Name */}
                <div style={formGroupStyle}>
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    placeholder="Last Name"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>

                {/* Email Address */}
                <div style={formGroupStyle}>
                  <label htmlFor="emailAddress">Email Address</label>
                  <input
                    id="emailAddress"
                    placeholder="Email Address"
                    value={form.emailAddress}
                    type="email"
                    onChange={(e) => setForm({ ...form, emailAddress: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>

                {/* Address Line */}
                <div style={formGroupStyle}>
                  <label htmlFor="addressLine">Address Line</label>
                  <input
                    id="addressLine"
                    placeholder="Address Line"
                    value={form.addressLine}
                    onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                {/* Country */}
                <div style={formGroupStyle}>
                  <label htmlFor="country">Country</label>
                  <input
                    id="country"
                    placeholder="Country"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                {/* State */}
                <div style={formGroupStyle}>
                  <label htmlFor="state">State</label>
                  <input
                    id="state"
                    placeholder="State"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                {/* Zip Code */}
                <div style={formGroupStyle}>
                  <label htmlFor="zipCode">Zip Code</label>
                  <input
                    id="zipCode"
                    placeholder="Zip Code"
                    value={form.zipCode}
                    onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                {/* Card Name */}
                <div style={formGroupStyle}>
                  <label htmlFor="cardName">Card Name</label>
                  <input
                    id="cardName"
                    placeholder="Card Name"
                    value={form.cardName}
                    onChange={(e) => setForm({ ...form, cardName: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                {/* Card Number */}
                <div style={formGroupStyle}>
                  <label htmlFor="cardNumber">Card Number</label>
                  <input
                    id="cardNumber"
                    placeholder="Card Number"
                    value={form.cardNumber}
                    onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                {/* Expiration */}
                <div style={formGroupStyle}>
                  <label htmlFor="expiration">Expiration (MM/YY)</label>
                  <input
                    id="expiration"
                    placeholder="Expiration (MM/YY)"
                    value={form.expiration}
                    onChange={(e) => setForm({ ...form, expiration: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                {/* CVV */}
                <div style={formGroupStyle}>
                  <label htmlFor="cvv">CVV</label>
                  <input
                    id="cvv"
                    placeholder="CVV"
                    value={form.cvv}
                    onChange={(e) => setForm({ ...form, cvv: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                {/* Payment Method */}
                <div style={formGroupStyle}>
                  <label htmlFor="paymentMethod">Payment Method (1-3)</label>
                  <input
                    id="paymentMethod"
                    placeholder="Payment Method (1-3)"
                    value={form.paymentMethod}
                    onChange={(e) => handleNumericChange(e, "paymentMethod")}
                    style={inputStyle}
                    inputMode="numeric"
                  />
                </div>

                {/* FIN DE CAMPOS CON ETIQUETAS EXTERNAS */}

              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    background:
                      "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "white",
                    padding: "18px",
                    borderRadius: "10px",
                    border: "none",
                    fontSize: "18px",
                    fontWeight: "bold",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    boxShadow: "0 6px 15px rgba(16, 185, 129, 0.4)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.transform = "translateY(-2px)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.transform = "translateY(0)")
                  }
                >
                  {loading
                    ? "⏳ Procesando..."
                    : form.id
                    ? "💾 Guardar Cambios"
                    : "➕ Crear Nueva Orden"}
                </button>
                {form.id && (
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{
                      background: "#94a3b8",
                      color: "white",
                      padding: "18px 30px",
                      borderRadius: "10px",
                      border: "none",
                      fontSize: "18px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                  >
                    ❌ Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Tabla de Órdenes */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 15px 50px rgba(0,0,0,0.15)",
              border: "1px solid #e2e8f0",
            }}
          >
            <h2
              style={{
                fontSize: "1.6rem",
                fontWeight: "800",
                color: "white",
                padding: "20px 30px",
                margin: 0,
                background: "linear-gradient(90deg, #1e40af 0%, #3b82f6 100%)",
              }}
            >
              📦 Historial de Órdenes ({orders.length})
            </h2>

            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: "#6b7280",
                }}
              >
                <div style={{ fontSize: "100px", marginBottom: "20px" }}>
                  <span className="rabbit-bounce">🐰</span>
                </div>
                <p
                  style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    color: "#3b82f6",
                  }}
                >
                  Cargando datos...
                </p>
              </div>
            ) : orders.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    minWidth: "1000px",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f8fafc", color: "#1e293b" }}>
                      <th
                        style={{
                          padding: "15px 20px",
                          textAlign: "left",
                          fontWeight: "bold",
                          fontSize: "15px",
                          borderBottom: "2px solid #e2e8f0",
                          width: "5%",
                        }}
                      >
                        ID
                      </th>
                      <th
                        style={{
                          padding: "15px 20px",
                          textAlign: "left",
                          fontWeight: "bold",
                          fontSize: "15px",
                          borderBottom: "2px solid #e2e8f0",
                          width: "10%",
                        }}
                      >
                        Username
                      </th>
                      <th
                        style={{
                          padding: "15px 20px",
                          textAlign: "left",
                          fontWeight: "bold",
                          fontSize: "15px",
                          borderBottom: "2px solid #e2e8f0",
                          width: "10%",
                        }}
                      >
                        Total
                      </th>
                      <th
                        style={{
                          padding: "15px 20px",
                          textAlign: "left",
                          fontWeight: "bold",
                          fontSize: "15px",
                          borderBottom: "2px solid #e2e8f0",
                          width: "15%",
                        }}
                      >
                        Nombre Cliente
                      </th>
                      <th
                        style={{
                          padding: "15px 20px",
                          textAlign: "left",
                          fontWeight: "bold",
                          fontSize: "15px",
                          borderBottom: "2px solid #e2e8f0",
                          width: "20%",
                        }}
                      >
                        Email
                      </th>
                      <th
                        style={{
                          padding: "15px 20px",
                          textAlign: "left",
                          fontWeight: "bold",
                          fontSize: "15px",
                          borderBottom: "2px solid #e2e8f0",
                          width: "20%",
                        }}
                      >
                        Dirección
                      </th>
                      <th
                        style={{
                          padding: "15px 20px",
                          textAlign: "center",
                          fontWeight: "bold",
                          fontSize: "15px",
                          borderBottom: "2px solid #e2e8f0",
                          width: "20%",
                        }}
                      >
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => {
                      const orderId = order.id || order.Id || order.ID;
                      return (
                        <tr
                          key={orderId}
                          style={{
                            background: index % 2 === 0 ? "#fcfdff" : "white",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#eff6ff")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background =
                              index % 2 === 0 ? "#fcfdff" : "white")
                          }
                        >
                          <td
                            style={{
                              padding: "15px 20px",
                              borderBottom: "1px solid #e2e8f0",
                              fontWeight: "700",
                              color: "#334155",
                            }}
                          >
                            #{orderId}
                          </td>
                          <td
                            style={{
                              padding: "15px 20px",
                              borderBottom: "1px solid #e2e8f0",
                              color: "#3b82f6",
                              fontWeight: "600",
                            }}
                          >
                            {order.userName || order.UserName}
                          </td>
                          {/* ⚠️ CÓDIGO MODIFICADO: Se quitó el bold (**) del precio total */}
                          <td
                            style={{
                              padding: "15px 20px",
                              borderBottom: "1px solid #e2e8f0",
                              color: "#059669",
                              fontWeight: "bold",
                            }}
                          >
                            $
                            {(
                              order.totalPrice ||
                              order.TotalPrice ||
                              0
                            ).toFixed(2)}
                          </td>
                          <td
                            style={{
                              padding: "15px 20px",
                              borderBottom: "1px solid #e2e8f0",
                            }}
                          >
                            {order.firstName || order.FirstName}{" "}
                            {order.lastName || order.LastName}
                          </td>
                          <td
                            style={{
                              padding: "15px 20px",
                              borderBottom: "1px solid #e2e8f0",
                              fontSize: "0.9em",
                              color: "#475569",
                            }}
                          >
                            {order.emailAddress || order.EmailAddress}
                          </td>
                          <td
                            style={{
                              padding: "15px 20px",
                              borderBottom: "1px solid #e2e8f0",
                              fontSize: "0.9em",
                              color: "#475569",
                            }}
                          >
                            {order.addressLine || order.AddressLine}
                          </td>
                          <td
                            style={{
                              padding: "15px 20px",
                              borderBottom: "1px solid #e2e8f0",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                gap: "8px",
                                flexWrap: "nowrap",
                              }}
                            >
                              <button
                                onClick={() => handleEditClick(order)}
                                style={actionButtonStyle("#f97316", "#f59e0b")}
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleSendToRabbitMQ(order)}
                                disabled={loading}
                                style={actionButtonStyle(
                                  "#8b5cf6",
                                  "#a78bfa",
                                  loading
                                )}
                              >
                                🐰
                              </button>
                              <button
                                onClick={() => handleDelete(order)}
                                disabled={loading}
                                style={actionButtonStyle(
                                  "#ef4444",
                                  "#f87171",
                                  loading
                                )}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: "#6b7280",
                }}
              >
                <div style={{ fontSize: "100px", marginBottom: "20px" }}>
                  📭
                </div>
                <p style={{ fontSize: "22px", fontWeight: "600" }}>
                  ¡Listo para crear! No hay órdenes registradas.
                </p>
              </div>
            )}
          </div>

          {/* Pie de página/Información de carrera */}
          <div
            style={{
              textAlign: "center",
              marginTop: "40px",
              paddingTop: "20px",
              borderTop: "1px solid #e2e8f0",
              color: "#94a3b8",
              fontSize: "14px",
            }}
          >
            <p style={{ margin: 0 }}>
              **Diseño React Web** | Ingeniería en Desarrollo de Software Multiplataforma.
            </p>
            <p style={{ margin: "5px 0 0 0", fontWeight: "600" }}>
              Backend: API REST (CRUD) & RabbitMQ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Estilos auxiliares para mayor limpieza y consistencia

const inputStyle = {
  padding: "16px",
  fontSize: "16px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  outline: "none",
  transition: "border-color 0.3s, box-shadow 0.3s",
  boxSizing: "border-box", // Asegura que el padding no cause desbordamiento
};

// **NUEVO ESTILO PARA EL GRUPO DE FORMULARIO**
const formGroupStyle = {
  display: 'flex',
  flexDirection: 'column', // Apila el label y el input verticalmente
  gap: '5px', // Pequeño espacio entre el label y el input
  fontSize: '15px',
  fontWeight: '600',
  color: '#334155',
  minWidth: '250px', // Asegura que se mantenga el ancho mínimo para la rejilla
};

const actionButtonStyle = (bgColor, hoverColor, disabled) => ({
  background: bgColor,
  color: "white",
  padding: "10px 15px",
  borderRadius: "8px",
  border: "none",
  fontSize: "14px",
  fontWeight: "600",
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.6 : 1,
  transition: "background 0.2s, transform 0.2s, opacity 0.2s",
  minWidth: "40px", // Para que los botones se vean uniformes
});