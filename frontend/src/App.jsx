import { useState, useEffect, useCallback } from "react";
import "./App.css";

const INITIAL_ITEMS = [
  { id: 1, nombre: "Tour Chichén Itzá", emoji: "🏛️", adultos: 1, ninos: 0, horaSalida: "9:00", precio: 1881, descuentoPct: 30, adicional: { nombre: "Paquete de Fotos", precio: 475 }, fecha: "" },
  { id: 2, nombre: "Tour Catamarán Cozumel", emoji: "🤿", adultos: 1, ninos: 0, horaSalida: "9:00", precio: 1881, descuentoPct: 30, adicional: { nombre: "Paquete de Fotos", precio: 475 }, fecha: "" },
];

const TIMER_INICIAL = 9 * 60 + 52;
const fmt = (val) => "$" + val.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const today = () => new Date().toISOString().split("T")[0];

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ cantidad }) {
  return (
    <nav className="navbar">
      <a href="#" className="nav-logo">
        <div className="nav-logo-icon">📍</div>
        <div><div className="brand">TOURIA</div><div className="brand-sub">Agencia de Viajes</div></div>
      </a>
      <ul className="nav-links">
        {["TOURS", "BLOG", "GRUPOS", "OFERTAS"].map((item) => (
          <li key={item}><a href="#" className="nav-link">{item} ▾</a></li>
        ))}
      </ul>
      <div className="nav-actions">
        <span className="lang">ESP 🇲🇽 ▾</span>
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.21 1.22 2 2 0 012.22.04h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81A2 2 0 017.37 6.7L6.09 7.98a16 16 0 006.29 6.29l1.28-1.28a2 2 0 012.16-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" /></svg>
        <div className="cart-icon-wrap">
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
          {cantidad > 0 && <span className="cart-badge">{cantidad}</span>}
        </div>
      </div>
    </nav>
  );
}

// ─── TimerBanner ──────────────────────────────────────────────────────────────
function TimerBanner({ segundos, expirado }) {
  const m = Math.floor(segundos / 60).toString().padStart(2, "0");
  const s = (segundos % 60).toString().padStart(2, "0");
  return (
    <div className="timer-banner">
      <div className="check-icon">✓</div>
      {expirado
        ? <span>⏰ El carrito ha <strong>expirado</strong>.</span>
        : <span>CARRITO DE COMPRAS expira en <span className="timer-clock">{m}:{s}</span> min</span>}
    </div>
  );
}

// ─── TourCard ─────────────────────────────────────────────────────────────────
function TourCard({ item, onRemove, onFechaChange }) {
  const [removing, setRemoving] = useState(false);
  const [visible, setVisible] = useState(true);
  const handleRemove = () => { setRemoving(true); setTimeout(() => { setVisible(false); onRemove(item.id); }, 350); };
  if (!visible) return null;
  const totalItem = item.precio - item.precio * (item.descuentoPct / 100);
  return (
    <div className={`tour-card ${removing ? "removing" : ""}`}>
      <div className="tour-card-top">
        <div className="tour-img">{item.emoji}</div>
        <div className="tour-nombre-col"><div className="tour-name">{item.nombre}</div></div>
        <div className="tour-detalle-col">
          <div className="tour-pax">Pers. {item.adultos} Adulto (12+)</div>
          <div className="tour-pax">{item.ninos} Niños (6 a 11)</div>
          <div className="tour-date-row">
            <span>Fecha:</span>
            <input type="date" className="date-input" value={item.fecha || today()} onChange={(e) => onFechaChange(item.id, e.target.value)} />
          </div>
          <div className="tour-time">Hora de salida: {item.horaSalida}</div>
        </div>
        <div className="tour-pricing">
          <div className="pricing-label">Precio</div>
          <div className="pricing-price">{fmt(item.precio)}</div>
          <div className="pricing-discount">{item.descuentoPct}% DESC</div>
          <div className="pricing-label total-label">Total MXN</div>
          <div className="pricing-total">{fmt(totalItem)}</div>
        </div>
      </div>
      <div className="tour-card-bottom">
        <div className="tour-adicional">Adicionales: <strong>{item.adicional.nombre} • {fmt(item.adicional.precio)} MXN p/p</strong></div>
        <div className="tour-card-actions">
          <button className="btn-link">Más información</button>
          <button className="btn-remove" onClick={handleRemove}>✕ Eliminar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ mensaje, visible }) {
  return <div className={`toast ${visible ? "toast--visible" : ""}`}>{mensaje}</div>;
}

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA CARRITO
// ══════════════════════════════════════════════════════════════════════════════
function CarritoPage({ items, setItems, segundos, expirado, onContinuar, showToast }) {
  const [codigo, setCodigo] = useState("");
  const handleRemove = (id) => { setItems((p) => p.filter((i) => i.id !== id)); showToast("Tour eliminado del carrito."); };
  const handleFechaChange = (id, fecha) => setItems((p) => p.map((i) => i.id === id ? { ...i, fecha } : i));

  const subtotal  = items.reduce((a, i) => a + i.precio, 0);
  const descuento = items.reduce((a, i) => a + i.precio * (i.descuentoPct / 100), 0);
  const fotos     = items.reduce((a, i) => a + i.adicional.precio, 0);
  const total     = (subtotal - descuento + fotos) * 1.16;

  return (
    <main className="main">
      <h1 className="page-title">Carrito de Compras</h1>
      <TimerBanner segundos={segundos} expirado={expirado} />
      <p className="save-note">Tus tours serán guardados por 15 min. antes de ser eliminados automáticamente de tu carrito.</p>
      <div className="layout">
        <div className="cart-column">
          {items.length === 0
            ? <div className="empty-cart"><div className="empty-icon">🛒</div><p>Tu carrito está vacío.</p></div>
            : items.map((item) => <TourCard key={item.id} item={item} onRemove={handleRemove} onFechaChange={handleFechaChange} />)
          }
          <div className="policies"><strong>Políticas de Cancelación</strong><br />Para más información, consulta nuestras <a href="#" className="policy-link">Políticas de reservación o cancelación.</a></div>
          <div className="policies" style={{ marginTop: 12 }}><strong>Términos & Condiciones</strong><br />Los descuentos no se aplican a los tours privados. Los descuentos, promociones y/o ofertas especiales no son acumulables.</div>
        </div>
        <div className="sidebar">
          <div className="promo-box">
            <p className="promo-label">Ingresa código de promoción</p>
            <div className="promo-input-wrap">
              <input type="text" className="promo-input" placeholder="Código promo..." value={codigo} onChange={(e) => setCodigo(e.target.value)} />
              <button className="btn-apply" onClick={() => { if (!codigo.trim()) showToast("Ingresa un código."); else showToast(`Código "${codigo}" no válido.`); }}>Aplicar</button>
            </div>
          </div>
          <div className="resumen-box">
            <div className="resumen-title">Resumen</div>
            {[
              { label: "Subtotal", valor: subtotal > 0 ? fmt(subtotal) : "$0" },
              { label: "Descuento en línea", valor: descuento > 0 ? `- ${fmt(descuento)}` : "$0" },
              { label: "Paquete de Fotos", valor: fotos > 0 ? fmt(fotos) : "$0" },
              { label: "Asistencia de Viajes", valor: "$0" },
              { label: "Cargo por Servicio", valor: "$0" },
            ].map((f) => <div key={f.label} className="resumen-row"><span>{f.label}</span><span>{f.valor}</span></div>)}
            <div className="resumen-total-row">
              <span>Total (IVA incluido)</span>
              <span className="resumen-total-price">{total > 0 ? `${fmt(total)} MXN` : "$0 MXN"}</span>
            </div>
            <button className="btn-continuar" onClick={onContinuar}>CONTINUAR</button>
          </div>
        </div>
      </div>
    </main>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PÁGINA DATOS DE CONTACTO
// ══════════════════════════════════════════════════════════════════════════════
function ContactoPage({ items, segundos, expirado, showToast }) {
  const [form, setForm] = useState({ nombre: "", apellido1: "", apellido2: "", email: "", telefono: "", hospedaje: "", pago: "" });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const subtotal  = items.reduce((a, i) => a + i.precio, 0);
  const descuento = items.reduce((a, i) => a + i.precio * (i.descuentoPct / 100), 0);
  const fotos     = items.reduce((a, i) => a + i.adicional.precio, 0);
  const total     = (subtotal - descuento + fotos) * 1.16;

  const handlePagar = () => {
    const { nombre, apellido1, email, telefono, hospedaje, pago } = form;
    if (!nombre || !apellido1 || !email || !telefono || !hospedaje || !pago)
      return showToast("Por favor completa todos los campos requeridos.");
    showToast("✅ ¡Reservación realizada con éxito!");
  };

  return (
    <main className="main">
      <h1 className="page-title page-title--contacto">Datos de Contacto</h1>
      <TimerBanner segundos={segundos} expirado={expirado} />
      <p className="save-note">Tus tours serán guardados por 15 min. antes de ser eliminados automáticamente de tu carrito.</p>

      <div className="layout">
        {/* ── Formulario ── */}
        <div className="cart-column">

          {/* Información de contacto */}
          <div className="contacto-seccion">
            <div className="contacto-seccion-header">
              <span className="contacto-seccion-title">INFORMACIÓN DEL CONTACTO</span>
              <span className="contacto-requerido">*Requerido</span>
            </div>
            <div className="contacto-grid">
              <input className="contacto-input" placeholder="*NOMBRE(S)" value={form.nombre} onChange={set("nombre")} />
              <input className="contacto-input" placeholder="*PRIMER APELLIDO" value={form.apellido1} onChange={set("apellido1")} />
              <input className="contacto-input" placeholder="SEGUNDO APELLIDO" value={form.apellido2} onChange={set("apellido2")} />
              <input className="contacto-input" placeholder="*CORREO ELECTRÓNICO" type="email" value={form.email} onChange={set("email")} />
            </div>
            <div className="contacto-telefono-wrap">
              <div className="tel-prefix">🇲🇽</div>
              <input className="contacto-input tel-input" placeholder="*NÚMERO DE TELÉFONO" type="tel" value={form.telefono} onChange={set("telefono")} />
            </div>
          </div>

          {/* Hospedaje */}
          <div className="contacto-seccion">
            <div className="contacto-seccion-header">
              <span className="contacto-seccion-title">LUGAR DE HOSPEDAJE</span>
            </div>
            <p className="contacto-sub">¿DÓNDE TE ESTARÁS HOSPEDANDO?</p>
            <input className="contacto-input full" placeholder="*SELECCIONA TU LUGAR DE HOSPEDAJE" value={form.hospedaje} onChange={set("hospedaje")} />
          </div>

          {/* Método de pago */}
          <div className="contacto-seccion">
            <div className="contacto-seccion-header">
              <span className="contacto-seccion-title">MÉTODO DE PAGO</span>
            </div>
            <div className="pago-opciones">
              <label className={`pago-opcion ${form.pago === "tarjeta" ? "pago-opcion--active" : ""}`}>
                <input type="radio" name="pago" value="tarjeta" onChange={set("pago")} hidden />
                <span className="pago-nombre">TARJETA DE CRÉDITO O DÉBITO</span>
                <div className="pago-logos">
                  <span className="pago-logo-text mc">MC</span>
                  <span className="pago-logo-text visa">VISA</span>
                </div>
              </label>
              <label className={`pago-opcion ${form.pago === "paypal" ? "pago-opcion--active" : ""}`}>
                <input type="radio" name="pago" value="paypal" onChange={set("pago")} hidden />
                <span className="pago-nombre">PAYPAL</span>
                <span className="pago-logo-text paypal">PayPal</span>
              </label>
              <label className={`pago-opcion ${form.pago === "mercadopago" ? "pago-opcion--active" : ""}`}>
                <input type="radio" name="pago" value="mercadopago" onChange={set("pago")} hidden />
                <span className="pago-nombre">MERCADO PAGO</span>
                <span className="pago-logo-text mp">MP</span>
              </label>
            </div>
          </div>

          <div className="policies"><strong>Políticas de Cancelación</strong><br />Para más información, consulta nuestras <a href="#" className="policy-link">Políticas de reservación o cancelación.</a></div>
          <div className="policies" style={{ marginTop: 12 }}><strong>Términos & Condiciones</strong><br />Los descuentos no se aplican a los tours privados.</div>
        </div>

        {/* ── Sidebar resumen ── */}
        <div className="sidebar">
          <div className="resumen-box resumen-box--contacto">
            <div className="resumen-contacto-header">{items.length} TOUR{items.length !== 1 ? "S" : ""}</div>

            {items.map((item) => {
              const totalItem = item.precio - item.precio * (item.descuentoPct / 100);
              return (
                <div key={item.id} className="mini-tour-card">
                  <div className="mini-tour-img">{item.emoji}</div>
                  <div className="mini-tour-info">
                    <div className="mini-tour-name">{item.nombre}</div>
                    <div className="mini-tour-meta">{item.fecha || "00/00/00"}</div>
                    <div className="mini-tour-meta">{item.adultos} Adulto(s) +{item.ninos} Niños (6 a 11)</div>
                    <div className="mini-tour-meta">{item.horaSalida}am</div>
                    <div className="mini-tour-precios">
                      <span className="mini-precio-tachado">{fmt(item.precio)}</span>
                      <span className="mini-precio-desc">{fmt(totalItem)}</span>
                    </div>
                    <div className="mini-tour-adicional">Servicios adicionales:</div>
                    <div className="mini-tour-adicional">{item.adicional.nombre}</div>
                    <div className="mini-tour-adicional" style={{ marginTop: 4 }}>Total MXN</div>
                    <div className="mini-tour-total">{fmt(totalItem + item.adicional.precio)} MXN</div>
                  </div>
                </div>
              );
            })}

            <div className="resumen-title" style={{ marginTop: 16 }}>RESUMEN</div>
            {[
              { label: "Subtotal", valor: subtotal > 0 ? fmt(subtotal) : "$0" },
              { label: "Asistencia de Viajes", valor: "$0" },
              { label: "Cargo por Servicio", valor: "$0" },
            ].map((f) => <div key={f.label} className="resumen-row"><span>{f.label}</span><span>{f.valor}</span></div>)}
            <div className="resumen-total-row">
              <span>Total (IVA incluido)</span>
              <span className="resumen-total-price">{total > 0 ? `${fmt(total)} MXN` : "$0 MXN"}</span>
            </div>
            <button className="btn-continuar" onClick={handlePagar}>PAGAR</button>
          </div>
        </div>
      </div>
    </main>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [pagina, setPagina]     = useState("carrito");
  const [items, setItems]       = useState(INITIAL_ITEMS.map((i) => ({ ...i, fecha: today() })));
  const [segundos, setSegundos] = useState(TIMER_INICIAL);
  const [expirado, setExpirado] = useState(false);
  const [toast, setToast]       = useState({ msg: "", visible: false });

  useEffect(() => {
    if (expirado) return;
    const interval = setInterval(() => {
      setSegundos((prev) => {
        if (prev <= 1) { clearInterval(interval); setExpirado(true); setItems([]); showToast("⏰ El carrito ha expirado."); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [expirado]);

  const showToast = useCallback((msg) => {
    setToast({ msg, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  }, []);

  return (
    <div className="app">
      <Navbar cantidad={items.length} />
      {pagina === "carrito"
        ? <CarritoPage items={items} setItems={setItems} segundos={segundos} expirado={expirado} onContinuar={() => { if (items.length === 0) return showToast("Tu carrito está vacío."); setPagina("contacto"); window.scrollTo(0, 0); }} showToast={showToast} />
        : <ContactoPage items={items} segundos={segundos} expirado={expirado} showToast={showToast} />
      }
      <Toast mensaje={toast.msg} visible={toast.visible} />
    </div>
  );
}
