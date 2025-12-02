import React, { useState } from "react";

function LoginRegister({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // 🔹 Validaciones simples
  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "El correo es obligatorio.";
    if (!formData.password.trim())
      newErrors.password = "La contraseña es obligatoria.";

    // Solo en registro
    if (!isLogin && !formData.firstName.trim())
      newErrors.firstName = "El nombre es obligatorio.";
    if (!isLogin && !formData.lastName.trim())
      newErrors.lastName = "El apellido es obligatorio.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔹 Manejador del submit
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (!validate()) return;
    setLoading(true);
    setErrors({}); // Limpiar errores previos

    try {
      let response;
      let data;

      if (isLogin) {
        // 🔸 LOGIN
        response = await fetch("https://localhost:42168/api/Users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        if (!response.ok) {
          if (response.status === 401) {
            setErrors({ password: "Credenciales inválidas." });
            setLoading(false);
            return;
          }
          const errorText = await response.text();
          throw new Error(errorText || `Error ${response.status}`);
        }

        data = await response.json();
        console.log("✅ Login correcto:", data);

        // Llamar a la función onLogin pasada por props
        if (onLogin) {
          onLogin(data);
        }
      } else {
        // 🔸 REGISTRO
        response = await fetch("https://localhost:42168/api/Users/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Error ${response.status}`);
        }

        data = await response.json();
        console.log("✅ Registro exitoso:", data);
        // Cambiar automáticamente a pantalla de login después de registrarse
        setIsLogin(true);
      }

      // 🔹 Limpiar formulario
      setFormData({ firstName: "", lastName: "", email: "", password: "" });
    } catch (error) {
      console.error("❌ Error:", error);
      setErrors({
        general: error.message || "Ocurrió un error al procesar la solicitud.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Panel del formulario */}
      <div className="form-panel">
        <div className="card">
          <div className="card-header">
            <div className="tab-switcher">
              <button 
                className={`tab ${isLogin ? 'active' : ''}`}
                onClick={() => {
                  setIsLogin(true);
                  setErrors({});
                }}
              >
                Iniciar Sesión
              </button>
              <button 
                className={`tab ${!isLogin ? 'active' : ''}`}
                onClick={() => {
                  setIsLogin(false);
                  setErrors({});
                }}
              >
                Registrarse
              </button>
            </div>
            <p className="subtitle">
              {isLogin 
                ? "Bienvenido de nuevo, ingresa tus credenciales" 
                : "Crea tu cuenta y comienza hoy mismo"}
            </p>
          </div>

          <div>
            {/* Campos solo en REGISTRO */}
            {!isLogin && (
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="Juan"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className={errors.firstName ? "error" : ""}
                    />
                  </div>
                  {errors.firstName && (
                    <span className="error-text">{errors.firstName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Apellido</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      placeholder="Pérez"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className={errors.lastName ? "error" : ""}
                    />
                  </div>
                  {errors.lastName && (
                    <span className="error-text">{errors.lastName}</span>
                  )}
                </div>
              </div>
            )}

            {/* Correo */}
            <div className="form-group">
              <label>Correo electrónico</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={errors.email ? "error" : ""}
                />
              </div>
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            {/* Contraseña */}
            <div className="form-group">
              <label>Contraseña</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={errors.password ? "error" : ""}
                />
              </div>
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
            </div>

            {/* Errores generales */}
            {errors.general && (
              <div className="error-banner">
                <span className="error-icon">⚠️</span>
                {errors.general}
              </div>
            )}

            <button type="button" onClick={handleSubmit} className="btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="loading-spinner">⏳</span>
                  Procesando...
                </>
              ) : (
                <>
                  {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>
          </div>

          {isLogin && (
            <div className="forgot-password">
              <a href="#">¿Olvidaste tu contraseña?</a>
            </div>
          )}
        </div>
      </div>

      {/* 🎨 ESTILOS CREATIVOS Y PROFESIONALES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body, html, #root {
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          overflow-x: hidden;
        }

        body {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
        }

        .container {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          padding: 20px;
          overflow-y: auto;
        }

        .container::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(240, 147, 251, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(102, 126, 234, 0.2) 0%, transparent 50%);
          animation: pulse 15s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        /* ========== PANEL LATERAL DECORATIVO ========== */
        .side-panel {
          flex: 1;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 60px;
          color: white;
          overflow: hidden;
        }

        .side-panel::before {
          content: '';
          position: absolute;
          width: 500px;
          height: 500px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          top: -200px;
          right: -200px;
          animation: pulse 8s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        /* ========== PANEL DEL FORMULARIO ========== */
        .form-panel {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          position: relative;
          z-index: 1;
        }

        .card {
          background: white;
          padding: 48px;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-width: 480px;
          animation: slideIn 0.5s ease-out;
          backdrop-filter: blur(10px);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .card-header {
          margin-bottom: 32px;
        }

        .tab-switcher {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          background: #f1f3f5;
          padding: 6px;
          border-radius: 12px;
        }

        .tab {
          flex: 1;
          padding: 12px 24px;
          border: none;
          background: transparent;
          color: #6c757d;
          font-weight: 600;
          font-size: 15px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab.active {
          background: white;
          color: #667eea;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .subtitle {
          text-align: center;
          font-size: 14px;
          color: #6c757d;
          font-weight: 400;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 8px;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 18px;
          pointer-events: none;
        }

        input {
          width: 100%;
          padding: 13px 16px;
          padding-left: 48px;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          font-size: 15px;
          color: #2d3748;
          background: #f8f9fa;
          transition: all 0.3s ease;
          outline: none;
        }

        input:focus {
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        input::placeholder {
          color: #adb5bd;
        }

        input.error {
          border-color: #f03e3e;
          background: #fff5f5;
        }

        .error-text {
          display: block;
          color: #f03e3e;
          font-size: 13px;
          margin-top: 6px;
          font-weight: 500;
        }

        .error-banner {
          background: linear-gradient(135deg, #fff5f5 0%, #ffe3e3 100%);
          border: 2px solid #ffc9c9;
          color: #c92a2a;
          padding: 14px 18px;
          border-radius: 12px;
          font-size: 14px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
        }

        .error-icon {
          font-size: 20px;
        }

        .btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          position: relative;
          overflow: hidden;
        }

        .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }

        .btn:hover::before {
          left: 100%;
        }

        .btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(102, 126, 234, 0.45);
        }

        .btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-arrow {
          font-size: 20px;
          font-weight: bold;
          transition: transform 0.3s ease;
        }

        .btn:hover .btn-arrow {
          transform: translateX(4px);
        }

        .loading-spinner {
          display: inline-block;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .forgot-password {
          text-align: center;
          margin-top: 24px;
        }

        .forgot-password a {
          color: #667eea;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .forgot-password a:hover {
          color: #764ba2;
          text-decoration: underline;
        }

        /* ========== RESPONSIVE ========== */
        @media (max-width: 768px) {
          .container {
            padding: 15px;
          }

          .form-panel {
            padding: 0;
          }

          .card {
            padding: 36px 28px;
            border-radius: 20px;
            max-width: 100%;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .card-header {
            margin-bottom: 28px;
          }

          .brand-title {
            font-size: 28px;
          }
        }

        @media (max-width: 480px) {
          .container {
            padding: 10px;
          }

          .card {
            padding: 28px 20px;
            border-radius: 16px;
          }

          .tab {
            padding: 10px 16px;
            font-size: 14px;
          }

          input {
            padding: 12px 14px;
            padding-left: 44px;
            font-size: 14px;
          }

          .btn {
            padding: 14px;
            font-size: 15px;
          }

          label {
            font-size: 13px;
          }
        }

        @media (min-width: 1200px) {
          .card {
            max-width: 520px;
            padding: 56px;
          }
        }

        /* Accesibilidad */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

export default LoginRegister;