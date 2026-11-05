import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { getServicios, getClientes, generarFolio, createOrden, createCliente } from '../api/client';

const INITIAL_ITEM = {
  id: Date.now(),
  servicio_id: '',
  servicio_nombre: '',
  categoria_nombre: '',
  precio_unitario: 0,
  cantidad: 1,
  detalle: '',
  subtotal: 0
};

const INITIAL_FORM = {
  folio: '',
  cliente_id: '',
  fecha_prometida: '',
  notas: ''
};

function NuevaOrden() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [items, setItems] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchCliente, setSearchCliente] = useState('');
  const [searchServicio, setSearchServicio] = useState('');
  
  // Estado para nuevo cliente rápido
  const [showNewClienteModal, setShowNewClienteModal] = useState(false);
  const [newCliente, setNewCliente] = useState({ nombre: '', telefono: '', direccion: '', email: '' });

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      const [folioData, serviciosData, clientesData] = await Promise.all([
        generarFolio(),
        getServicios(),
        getClientes()
      ]);
      
      setServicios(serviciosData);
      setClientes(clientesData);
      
      const fecha = new Date();
      fecha.setDate(fecha.getDate() + 3);
      
      setFormData({
        folio: folioData.folio,
        cliente_id: '',
        fecha_prometida: fecha.toISOString().split('T')[0],
        notas: ''
      });
    } catch (error) {
      toast.error('Error cargando datos');
      console.error(error);
    }
  };

  const filteredClientes = useMemo(() => 
    clientes.filter(c => 
      c.nombre.toLowerCase().includes(searchCliente.toLowerCase()) || 
      (c.telefono && c.telefono.includes(searchCliente))
    ), [clientes, searchCliente]
  );

  const filteredServicios = useMemo(() => 
    servicios.filter(s => 
      s.nombre.toLowerCase().includes(searchServicio.toLowerCase()) || 
      s.categoria_nombre.toLowerCase().includes(searchServicio.toLowerCase())
    ), [servicios, searchServicio]
  );

  const total = useMemo(() => 
    items.reduce((sum, item) => sum + (item.subtotal || 0), 0), [items]
  );

  const agregarItem = (servicio = null) => {
    if (servicio) {
      const newItem = {
        ...INITIAL_ITEM,
        id: Date.now(),
        servicio_id: servicio.id,
        servicio_nombre: servicio.nombre,
        categoria_nombre: servicio.categoria_nombre,
        precio_unitario: servicio.precio_base,
        subtotal: servicio.precio_base,
        cantidad: 1
      };
      setItems(prev => [...prev, newItem]);
      setSearchServicio('');
    } else {
      const newItem = { ...INITIAL_ITEM, id: Date.now() };
      setItems(prev => [...prev, newItem]);
    }
  };

  const eliminarItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const actualizarItem = (id, campo, valor) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      
      const updated = { ...item, [campo]: valor };
      
      if (campo === 'servicio_id') {
        const servicio = servicios.find(s => s.id === parseInt(valor));
        updated.servicio_nombre = servicio?.nombre || '';
        updated.categoria_nombre = servicio?.categoria_nombre || '';
        updated.precio_unitario = servicio?.precio_base || 0;
      }
      
      if (campo === 'cantidad') {
        updated.cantidad = parseInt(valor) || 1;
      }
      
      updated.subtotal = updated.precio_unitario * updated.cantidad;
      return updated;
    }));
  };

  // Crear cliente rápido
  const handleCreateCliente = async (e) => {
    e.preventDefault();
    if (!newCliente.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    
    try {
      await createCliente(newCliente);
      toast.success('✅ Cliente creado exitosamente');
      
      // Recargar clientes
      const clientesData = await getClientes();
      setClientes(clientesData);
      
      // Seleccionar el cliente recién creado
      const clienteCreado = clientesData.find(c => c.nombre === newCliente.nombre);
      if (clienteCreado) {
        setFormData(prev => ({ ...prev, cliente_id: clienteCreado.id }));
        setSearchCliente('');
      }
      
      setShowNewClienteModal(false);
      setNewCliente({ nombre: '', telefono: '', direccion: '', email: '' });
    } catch (error) {
      toast.error('Error al crear cliente');
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.cliente_id) {
      toast.error('❌ Seleccione un cliente');
      return;
    }
    
    if (!items.length || !items.some(i => i.servicio_id)) {
      toast.error('❌ Agregue al menos un servicio');
      return;
    }
    
    setLoading(true);
    
    try {
      const orden = {
        folio: formData.folio,
        cliente_id: parseInt(formData.cliente_id),
        fecha_prometida: formData.fecha_prometida,
        subtotal: total,
        descuento: 0,
        total: total,
        notas: formData.notas.trim()
      };
      
      const itemsData = items.map(item => ({
        servicio_id: parseInt(item.servicio_id),
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.subtotal,
        detalle: item.detalle
      }));
      
      await createOrden(orden, itemsData);
      toast.success('✅ ¡Orden creada exitosamente!');
      
      setItems([]);
      const nuevoFolio = await generarFolio();
      setFormData(prev => ({
        ...INITIAL_FORM,
        folio: nuevoFolio.folio,
        fecha_prometida: prev.fecha_prometida
      }));
      setSearchCliente('');
      setSearchServicio('');
    } catch (error) {
      toast.error('❌ Error al crear la orden');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nueva-orden-container">
      <div className="card">
        <div className="header">
          <div className="header-content">
            <div className="header-icon">🧺</div>
            <div>
              <h2>Nueva Orden</h2>
              <p>Folio: <strong>{formData.folio}</strong></p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {/* Cliente */}
          <div className="section">
            <div className="section-header">
              <span className="section-icon">👤</span>
              <h3>Cliente</h3>
            </div>
            <div className="search-input">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar cliente por nombre o teléfono..."
                value={searchCliente}
                onChange={(e) => setSearchCliente(e.target.value)}
                style={{ color: '#1e293b', background: 'white' }}
              />
            </div>
            
            {filteredClientes.length === 0 && searchCliente && (
              <div className="no-results">
                <p>No se encontró "{searchCliente}"</p>
                <button 
                  type="button" 
                  className="new-client-btn"
                  onClick={() => setShowNewClienteModal(true)}
                >
                  + Crear nuevo cliente
                </button>
              </div>
            )}
            
            {filteredClientes.length > 0 && (
              <select
                value={formData.cliente_id}
                onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                required
                style={{ color: '#1e293b', background: 'white' }}
              >
                <option value="">-- Seleccionar cliente --</option>
                {filteredClientes.slice(0, 10).map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} {c.telefono && `📞 ${c.telefono}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Fecha */}
          <div className="section">
            <div className="section-header">
              <span className="section-icon">📅</span>
              <h3>Fecha de Entrega</h3>
            </div>
            <input
              type="date"
              value={formData.fecha_prometida}
              onChange={(e) => setFormData({ ...formData, fecha_prometida: e.target.value })}
              required
              style={{ color: '#1e293b', background: 'white' }}
            />
            <small className="field-hint">Fecha estimada en que la ropa estará lista</small>
          </div>

          {/* Servicios */}
          <div className="section">
            <div className="section-header">
              <span className="section-icon">👕</span>
              <h3>Servicios</h3>
              {items.length > 0 && <span className="badge">{items.length} ítems</span>}
            </div>

            <div className="quick-add">
              <div className="search-input">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Buscar servicio para agregar rápidamente..."
                  value={searchServicio}
                  onChange={(e) => setSearchServicio(e.target.value)}
                  style={{ color: '#1e293b', background: 'white' }}
                />
              </div>
              {searchServicio && filteredServicios.length > 0 && (
                <div className="quick-services">
                  {filteredServicios.slice(0, 5).map(s => (
                    <button
                      key={s.id}
                      type="button"
                      className="quick-btn"
                      onClick={() => agregarItem(s)}
                    >
                      {s.nombre}
                      <span>${s.precio_base}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="items-list">
              {items.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👕</div>
                  <p>No hay servicios agregados</p>
                  <small>Haz clic en "Agregar servicio" para comenzar</small>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} className="item-card">
                    <select
                      value={item.servicio_id}
                      onChange={(e) => actualizarItem(item.id, 'servicio_id', e.target.value)}
                      required
                      style={{ color: '#1e293b', background: 'white' }}
                    >
                      <option value="">Seleccionar servicio</option>
                      {servicios.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.categoria_nombre} › {s.nombre} (${s.precio_base})
                        </option>
                      ))}
                    </select>
                    
                    <input
                      type="number"
                      value={item.cantidad}
                      onChange={(e) => actualizarItem(item.id, 'cantidad', e.target.value)}
                      min="1"
                      placeholder="Cant."
                      style={{ color: '#1e293b', background: 'white' }}
                    />
                    
                    <input
                      type="text"
                      value={item.detalle}
                      onChange={(e) => actualizarItem(item.id, 'detalle', e.target.value)}
                      placeholder="Detalle (opcional)"
                      style={{ color: '#1e293b', background: 'white' }}
                    />
                    
                    <div className="item-price">${item.subtotal.toFixed(2)}</div>
                    
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => eliminarItem(item.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              className="add-btn"
              onClick={() => agregarItem()}
            >
              + Agregar servicio
            </button>
          </div>

          {/* Notas */}
          <div className="section">
            <div className="section-header">
              <span className="section-icon">📝</span>
              <h3>Notas Adicionales</h3>
            </div>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              rows="3"
              placeholder="Ej: Prenda delicada, mancha difícil, urgencia, etc..."
              style={{ color: '#1e293b', background: 'white' }}
            />
          </div>

          {/* Total */}
          <div className="total-card">
            <div className="total-row">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Descuento</span>
              <span>$0.00</span>
            </div>
            <div className="total-final">
              <span>TOTAL</span>
              <span className="total-amount">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`submit-btn ${(!items.length || loading) ? 'disabled' : ''}`}
            disabled={loading || !items.length}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Procesando...
              </>
            ) : (
              `💾 Guardar Orden - $${total.toFixed(2)}`
            )}
          </button>
        </form>
      </div>

      {/* Modal para nuevo cliente */}
      {showNewClienteModal && (
        <div className="modal-overlay" onClick={() => setShowNewClienteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Nuevo Cliente</h3>
              <button className="modal-close" onClick={() => setShowNewClienteModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateCliente}>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={newCliente.nombre}
                  onChange={(e) => setNewCliente({ ...newCliente, nombre: e.target.value })}
                  placeholder="Nombre completo"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="text"
                  value={newCliente.telefono}
                  onChange={(e) => setNewCliente({ ...newCliente, telefono: e.target.value })}
                  placeholder="Número de teléfono"
                />
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  value={newCliente.direccion}
                  onChange={(e) => setNewCliente({ ...newCliente, direccion: e.target.value })}
                  placeholder="Dirección"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newCliente.email}
                  onChange={(e) => setNewCliente({ ...newCliente, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div className="modal-buttons">
                <button type="button" className="btn-cancel" onClick={() => setShowNewClienteModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .nueva-orden-container {
          padding: 24px;
          max-width: 1000px;
          margin: 0 auto;
          background: #eef2f5;
          min-height: 100vh;
        }

        .card {
          background: white;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        /* Header */
        .header {
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          padding: 28px 32px;
          color: white;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-icon {
          font-size: 3rem;
          background: rgba(255, 255, 255, 0.15);
          width: 70px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .header h2 {
          margin: 0 0 6px 0;
          font-size: 1.6rem;
          font-weight: 700;
        }

        .header p {
          margin: 0;
          opacity: 0.9;
          font-size: 0.95rem;
        }

        .header p strong {
          font-size: 1.1rem;
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 12px;
          border-radius: 20px;
          display: inline-block;
        }

        /* Form */
        .form {
          padding: 32px;
        }

        /* Sections */
        .section {
          background: #f8fafc;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e2e8f0;
        }

        .section-icon {
          font-size: 1.3rem;
        }

        .section-header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .badge {
          margin-left: auto;
          background: #2a5298;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .field-hint {
          display: block;
          margin-top: 6px;
          font-size: 0.7rem;
          color: #64748b;
        }

        /* Inputs - ahora con texto oscuro */
        .search-input {
          position: relative;
          margin-bottom: 16px;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .search-input input {
          width: 100%;
          padding: 12px 12px 12px 42px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          background: white;
          color: #1e293b;
          transition: all 0.2s;
        }

        .search-input input:focus {
          outline: none;
          border-color: #2a5298;
          box-shadow: 0 0 0 3px rgba(42, 82, 152, 0.1);
        }

        .search-input input::placeholder {
          color: #94a3b8;
        }

        select,
        input[type="date"],
        textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          background: white;
          color: #1e293b;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        select:focus,
        input:focus,
        textarea:focus {
          outline: none;
          border-color: #2a5298;
          box-shadow: 0 0 0 3px rgba(42, 82, 152, 0.1);
        }

        select option {
          color: #1e293b;
          background: white;
        }

        input::placeholder,
        textarea::placeholder {
          color: #94a3b8;
        }

        textarea {
          resize: vertical;
          font-family: inherit;
        }

        /* No results */
        .no-results {
          text-align: center;
          padding: 16px;
          background: #fef3c7;
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .no-results p {
          margin: 0 0 10px 0;
          color: #92400e;
        }

        .new-client-btn {
          padding: 8px 20px;
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .new-client-btn:hover {
          transform: translateY(-2px);
        }

        /* Quick services */
        .quick-services {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .quick-btn {
          padding: 8px 16px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #1e293b;
        }

        .quick-btn:hover {
          border-color: #2a5298;
          background: #eef2ff;
          transform: translateY(-2px);
        }

        .quick-btn span {
          color: #059669;
          font-weight: 700;
        }

        /* Items */
        .items-list {
          margin: 16px 0;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          background: #f1f5f9;
          border-radius: 12px;
          border: 2px dashed #cbd5e1;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 12px;
          opacity: 0.5;
        }

        .empty-state p {
          margin: 0;
          color: #475569;
          font-weight: 500;
        }

        .empty-state small {
          color: #94a3b8;
          font-size: 0.8rem;
        }

        .item-card {
          display: grid;
          grid-template-columns: 2fr 0.6fr 1.2fr 0.8fr 0.3fr;
          gap: 12px;
          align-items: center;
          background: white;
          padding: 12px;
          border-radius: 12px;
          margin-bottom: 10px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }

        .item-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .item-card select,
        .item-card input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 13px;
          background: white;
          color: #1e293b;
        }

        .item-price {
          font-weight: 700;
          color: #059669;
          text-align: right;
          font-size: 14px;
        }

        .delete-btn {
          width: 36px;
          height: 36px;
          border: none;
          background: #fee2e2;
          color: #dc2626;
          border-radius: 8px;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .delete-btn:hover {
          background: #fecaca;
          transform: scale(1.05);
        }

        .add-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 8px;
        }

        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(5, 150, 105, 0.3);
        }

        /* Total card */
        .total-card {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: white;
          padding: 24px;
          border-radius: 20px;
          margin: 24px 0;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          color: #94a3b8;
          font-size: 0.95rem;
        }

        .total-final {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding-top: 12px;
          margin-top: 8px;
          border-top: 2px solid #334155;
          font-size: 1.2rem;
          font-weight: 700;
          color: white;
        }

        .total-amount {
          font-size: 1.8rem;
          font-weight: 800;
          color: #4ade80;
        }

        /* Submit button */
        .submit-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .submit-btn:not(.disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(30, 60, 114, 0.3);
        }

        .submit-btn.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          width: 450px;
          max-width: 90%;
          overflow: hidden;
          animation: modalIn 0.3s ease;
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
        }

        .modal-header h3 {
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          opacity: 0.8;
        }

        .modal-close:hover {
          opacity: 1;
        }

        .modal-content form {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
          color: #1e293b;
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          color: #1e293b;
          background: white;
        }

        .form-group input:focus {
          outline: none;
          border-color: #2a5298;
        }

        .modal-buttons {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .btn-cancel {
          flex: 1;
          padding: 12px;
          background: #f1f5f9;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          color: #475569;
        }

        .btn-save {
          flex: 1;
          padding: 12px;
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          color: white;
        }

        .btn-save:hover {
          transform: translateY(-2px);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .nueva-orden-container {
            padding: 16px;
          }
          
          .form {
            padding: 20px;
          }
          
          .item-card {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          
          .item-price {
            text-align: left;
          }
          
          .header h2 {
            font-size: 1.3rem;
          }
          
          .header-icon {
            width: 50px;
            height: 50px;
            font-size: 2rem;
          }
          
          .total-amount {
            font-size: 1.4rem;
          }
        }
      `}</style>
    </div>
  );
}

export default NuevaOrden;