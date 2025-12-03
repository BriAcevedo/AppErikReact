import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Package, CheckCircle, X, Moon, Sun, ShoppingBag } from 'lucide-react';
import "../styles/TiendaUsuario.css";

// Configuración de APIs
const API_CONFIG = {
  products: 'https://localhost:44394/api/Products',
  orders: 'http://localhost:30928/api/v1/Order'
};

const TiendaUsuario = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [vista, setVista] = useState('productos');
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [ordenCreada, setOrdenCreada] = useState(null);

  const [formData, setFormData] = useState({
    userName: '',
    firstName: '',
    lastName: '',
    emailAddress: '',
    addressLine: '',
    country: 'Mexico',
    state: '',
    zipCode: '',
    cardName: '',
    cardNumber: '',
    expiration: '',
    cvv: '',
    paymentMethod: 0
  });

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : '';
  }, [darkMode]);

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_CONFIG.products);
      const data = await response.json();
      
      const productosArray = data.data || data || [];
      setProductos(productosArray);
      
      if (productosArray.length === 0) {
        mostrarNotificacion('No hay productos disponibles', 'warning');
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
      mostrarNotificacion('Error al cargar productos', 'error');
      setProductos([
        { id: 1, nombre: 'Producto 1', precio: 100, descripcion: 'Descripción 1', cantidad: 10 },
        { id: 2, nombre: 'Producto 2', precio: 200, descripcion: 'Descripción 2', cantidad: 5 },
        { id: 3, nombre: 'Producto 3', precio: 150, descripcion: 'Descripción 3', cantidad: 8 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const mostrarNotificacion = (mensaje, tipo = 'info') => {
    setNotification({ mensaje, tipo });
    setTimeout(() => setNotification(null), 4000);
  };

  const agregarAlCarrito = (producto) => {
    const itemExistente = carrito.find(item => item.id === producto.id);
    
    if (itemExistente) {
      setCarrito(carrito.map(item =>
        item.id === producto.id
          ? { ...item, cantidadCarrito: item.cantidadCarrito + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidadCarrito: 1 }]);
    }
    
    mostrarNotificacion(`${producto.nombre} agregado al carrito`, 'success');
    setCarritoAbierto(true);
  };

  const actualizarCantidad = (productoId, cantidad) => {
    if (cantidad <= 0) {
      eliminarDelCarrito(productoId);
      return;
    }
    
    setCarrito(carrito.map(item =>
      item.id === productoId
        ? { ...item, cantidadCarrito: cantidad }
        : item
    ));
  };

  const eliminarDelCarrito = (productoId) => {
    setCarrito(carrito.filter(item => item.id !== productoId));
    mostrarNotificacion('Producto eliminado del carrito', 'info');
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidadCarrito), 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validarFormulario = () => {
    const camposRequeridos = ['userName', 'firstName', 'lastName', 'emailAddress', 'addressLine', 'state', 'zipCode', 'cardName', 'cardNumber', 'expiration', 'cvv'];
    
    for (let campo of camposRequeridos) {
      if (!formData[campo] || formData[campo].trim() === '') {
        mostrarNotificacion(`El campo ${campo} es requerido`, 'warning');
        return false;
      }
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.emailAddress)) {
      mostrarNotificacion('Email inválido', 'warning');
      return false;
    }
    
    return true;
  };

  const crearOrden = async () => {
    console.log("🔎 Iniciando creación de orden...");

    if (!validarFormulario()) {
      console.warn("⚠️ Validación del formulario fallida");
      return;
    }

    if (carrito.length === 0) {
      console.warn("⚠️ El carrito está vacío. No se puede crear la orden.");
      mostrarNotificacion('El carrito está vacío', 'warning');
      return;
    }

    setLoading(true);

    try {
      const ordenData = {
        ...formData,
        paymentMethod: parseInt(formData.paymentMethod),
        productIds: carrito.flatMap(item => Array(item.cantidadCarrito).fill(item.id))
      };

      console.log("📦 Datos generados para enviar al backend:");
      console.log(JSON.stringify(ordenData, null, 2));

      const response = await fetch(API_CONFIG.orders, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ordenData)
      });

      console.log("📥 Respuesta recibida:");
      console.log("➡️ Status:", response.status, response.statusText);

      const responseText = await response.text();
      console.log("📄 Cuerpo de respuesta RAW:", responseText);

      let resultado = null;
      try {
        resultado = JSON.parse(responseText);
        console.log("📄 Cuerpo de respuesta (JSON parseado):", resultado);
      } catch (e) {
        console.error("❌ Error parseando JSON de la respuesta:", e);
      }

      if (response.ok) {
        setOrdenCreada(resultado);
        setVista('confirmacion');
        mostrarNotificacion('¡Orden creada exitosamente!', 'success');
        setCarrito([]);
      } else {
        console.error("❌ El backend respondió con error");
        throw new Error("Error al crear la orden");
      }

    } catch (error) {
      console.error("🚨 Error en crearOrden:", error);
      mostrarNotificacion('Error al procesar la orden', 'error');
    } finally {
      console.log("⏳ Finalizando proceso de creación de orden...");
      setLoading(false);
    }
  };

  const reiniciarCompra = () => {
    setVista('productos');
    setCarrito([]);
    setOrdenCreada(null);
    setFormData({
      userName: '',
      firstName: '',
      lastName: '',
      emailAddress: '',
      addressLine: '',
      country: 'Mexico',
      state: '',
      zipCode: '',
      cardName: '',
      cardNumber: '',
      expiration: '',
      cvv: '',
      paymentMethod: 0
    });
  };

  const renderProductos = () => (
    <div>
      <div className="search-container">
        <h2 className="section-title">
          <Package size={24} />
          Productos Disponibles
        </h2>
        <span className="product-count">
          {productos.length} productos en catálogo
        </span>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="loading-icon">⏳</div>
          <p>Cargando productos...</p>
        </div>
      ) : productos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <p className="empty-state-text">No hay productos disponibles</p>
        </div>
      ) : (
        <div className="product-grid">
          {productos.map(producto => (
            <div key={producto.id} className="product-card">
              <div className="product-image">
                📦
              </div>
              
              <h3 className="product-title">
                {producto.nombre}
              </h3>
              
              <p className="product-description">
                {producto.descripcion || 'Sin descripción'}
              </p>
              
              <div className="product-footer">
                <span className="product-price">
                  ${producto.precio.toFixed(2)}
                </span>
                <span className="product-stock">
                  Stock: {producto.cantidad}
                </span>
              </div>
              
              <button
                className="btn btn-primary btn-full"
                onClick={() => agregarAlCarrito(producto)}
                disabled={producto.cantidad === 0}
              >
                <ShoppingCart size={18} />
                {producto.cantidad === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCarritoLateral = () => (
    <div className={`cart-sidebar ${carritoAbierto ? 'open' : ''}`}>
      <div className="cart-header">
        <h2 className="cart-title">
          <ShoppingCart size={24} />
          Mi Carrito
          <span className="cart-badge">
            {carrito.length}
          </span>
        </h2>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setCarritoAbierto(false)}
        >
          <X size={20} />
        </button>
      </div>

      <div className="cart-content">
        {carrito.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <p className="empty-state-text">Tu carrito está vacío</p>
          </div>
        ) : (
          <div className="cart-items">
            {carrito.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-header">
                  <h4 className="cart-item-name">
                    {item.nombre}
                  </h4>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => eliminarDelCarrito(item.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="cart-item-footer">
                  <div className="quantity-controls">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => actualizarCantidad(item.id, item.cantidadCarrito - 1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="quantity-display">
                      {item.cantidadCarrito}
                    </span>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => actualizarCantidad(item.id, item.cantidadCarrito + 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="cart-item-price">
                    <div className="unit-price">
                      ${item.precio.toFixed(2)} c/u
                    </div>
                    <div className="total-price">
                      ${(item.precio * item.cantidadCarrito).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {carrito.length > 0 && (
        <div className="cart-footer">
          <div className="cart-total">
            <span>Total:</span>
            <span className="total-amount">
              ${calcularTotal().toFixed(2)}
            </span>
          </div>
          <button
            className="btn btn-success btn-lg btn-full"
            onClick={() => {
              setVista('checkout');
              setCarritoAbierto(false);
            }}
          >
            <CreditCard size={20} />
            Proceder al Pago
          </button>
        </div>
      )}
    </div>
  );

  const renderCheckout = () => (
    <div className="form-container">
      <div className="form-title">
        <CreditCard size={28} />
        Finalizar Compra
      </div>

      <div className="order-summary">
        <h3 className="order-summary-title">
          <Package size={20} />
          Resumen del Pedido
        </h3>
        {carrito.map(item => (
          <div key={item.id} className="order-item">
            <span>{item.nombre} x{item.cantidadCarrito}</span>
            <span className="order-item-price">
              ${(item.precio * item.cantidadCarrito).toFixed(2)}
            </span>
          </div>
        ))}
        <div className="order-total">
          <span>Total:</span>
          <span>${calcularTotal().toFixed(2)}</span>
        </div>
      </div>

      <h3 className="form-section-title">Información del Cliente</h3>
      <div className="form-grid">
        <input
          className="form-input"
          name="userName"
          placeholder="Usuario *"
          value={formData.userName}
          onChange={handleInputChange}
        />
        <input
          className="form-input"
          name="firstName"
          placeholder="Nombre *"
          value={formData.firstName}
          onChange={handleInputChange}
        />
        <input
          className="form-input"
          name="lastName"
          placeholder="Apellido *"
          value={formData.lastName}
          onChange={handleInputChange}
        />
        <input
          className="form-input"
          name="emailAddress"
          type="email"
          placeholder="Email *"
          value={formData.emailAddress}
          onChange={handleInputChange}
        />
      </div>

      <h3 className="form-section-title">Dirección de Envío</h3>
      <div className="form-grid">
        <input
          className="form-input span-2"
          name="addressLine"
          placeholder="Dirección *"
          value={formData.addressLine}
          onChange={handleInputChange}
        />
        <select
          className="form-input"
          name="country"
          value={formData.country}
          onChange={handleInputChange}
        >
          <option value="Mexico">México</option>
          <option value="USA">Estados Unidos</option>
          <option value="Canada">Canadá</option>
        </select>
        <input
          className="form-input"
          name="state"
          placeholder="Estado *"
          value={formData.state}
          onChange={handleInputChange}
        />
        <input
          className="form-input"
          name="zipCode"
          placeholder="Código Postal *"
          value={formData.zipCode}
          onChange={handleInputChange}
        />
      </div>

      <h3 className="form-section-title">Información de Pago</h3>
      <div className="form-grid">
        <select
          className="form-input"
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleInputChange}
        >
          <option value="0">Tarjeta de Crédito</option>
          <option value="1">Tarjeta de Débito</option>
          <option value="2">PayPal</option>
        </select>
        <input
          className="form-input"
          name="cardName"
          placeholder="Nombre en Tarjeta *"
          value={formData.cardName}
          onChange={handleInputChange}
        />
        <input
          className="form-input"
          name="cardNumber"
          placeholder="Número de Tarjeta *"
          value={formData.cardNumber}
          onChange={handleInputChange}
          maxLength="16"
        />
        <input
          className="form-input"
          name="expiration"
          placeholder="MM/YY *"
          value={formData.expiration}
          onChange={handleInputChange}
          maxLength="5"
        />
        <input
          className="form-input"
          name="cvv"
          placeholder="CVV *"
          value={formData.cvv}
          onChange={handleInputChange}
          maxLength="3"
          type="password"
        />
      </div>

      <div className="form-actions">
        <button
          className="btn btn-secondary btn-lg"
          onClick={() => setVista('productos')}
        >
          Volver a Productos
        </button>
        <button
          className="btn btn-success btn-lg"
          onClick={crearOrden}
          disabled={loading}
        >
          {loading ? '⏳ Procesando...' : '💳 Confirmar Compra'}
        </button>
      </div>
    </div>
  );

  const renderConfirmacion = () => (
    <div className="confirmation-container">
      <div className="confirmation-icon">
        <CheckCircle size={60} />
      </div>

      <h1 className="confirmation-title">
        ¡Orden Creada Exitosamente!
      </h1>

      <p className="confirmation-text">
        Tu pedido ha sido procesado correctamente. Recibirás un email de confirmación en breve.
      </p>

      {ordenCreada && (
        <div className="order-details">
          <h3>Detalles de la Orden</h3>
          <p><strong>Cliente:</strong> {formData.firstName} {formData.lastName}</p>
          <p><strong>Email:</strong> {formData.emailAddress}</p>
          
        </div>
      )}

      <button
        className="btn btn-primary btn-lg"
        onClick={reiniciarCompra}
      >
        <ShoppingBag size={20} />
        Realizar Nueva Compra
      </button>
    </div>
  );

  return (
    <div className="app-container">
      <div className="header">
        <h1 className="title">🛍️ Mi Tienda Online</h1>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          {vista !== 'confirmacion' && (
            <button
              className="btn btn-primary"
              onClick={() => setCarritoAbierto(true)}
            >
              <ShoppingCart size={18} />
              Carrito ({carrito.length})
            </button>
          )}
        </div>
      </div>

      <div className="main-content">
        {vista === 'productos' && renderProductos()}
        {vista === 'checkout' && renderCheckout()}
        {vista === 'confirmacion' && renderConfirmacion()}
      </div>

      {renderCarritoLateral()}

      {carritoAbierto && (
        <div
          className="cart-overlay"
          onClick={() => setCarritoAbierto(false)}
        />
      )}

      {notification && (
        <div className={`notification notification-${notification.tipo}`}>
          {notification.mensaje}
        </div>
      )}
    </div>
  );
};

export default TiendaUsuario;