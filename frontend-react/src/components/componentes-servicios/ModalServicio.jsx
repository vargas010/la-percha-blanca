import React, { useState } from 'react';
import { Tag, Plus, X, DollarSign, Clock } from 'lucide-react';
import { createServicio } from '../../api/client';
import toast from 'react-hot-toast';

function ModalServicio({ isOpen, onClose, onSuccess, categorias }) {
  const [formData, setFormData] = useState({
    categoria_id: '',
    nombre: '',
    precio_base: '',
    tiempo_estimado: 60
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createServicio(formData);
      toast.success('✅ Servicio creado exitosamente');
      setFormData({ categoria_id: '', nombre: '', precio_base: '', tiempo_estimado: 60 });
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('❌ Error al crear servicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <Tag size={24} />
            <h3>Nuevo Servicio</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="categoria">Categoría *</label>
            <select
              id="categoria"
              required
              value={formData.categoria_id}
              onChange={e => setFormData({...formData, categoria_id: e.target.value})}
              disabled={loading}
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="nombre-servicio">Nombre *</label>
            <input
              id="nombre-servicio"
              type="text"
              required
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
              placeholder="Ej: Lavado a seco, Planchado camisa..."
              disabled={loading}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="precio">Precio Base *</label>
              <div className="input-group">
                <DollarSign size={18} />
                <input
                  id="precio"
                  type="number"
                  step="0.01"
                  required
                  value={formData.precio_base}
                  onChange={e => setFormData({...formData, precio_base: e.target.value})}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="tiempo">Tiempo Estimado (min)</label>
              <div className="input-group">
                <Clock size={18} />
                <input
                  id="tiempo"
                  type="number"
                  value={formData.tiempo_estimado}
                  onChange={e => setFormData({...formData, tiempo_estimado: e.target.value})}
                  min="1"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Plus size={18} />
              {loading ? 'Creando...' : 'Crear Servicio'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          backdrop-filter: blur(4px);
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          width: min(90vw, 500px);
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header > div {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .modal-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 1.25rem;
        }

        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          padding: 0.25rem;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: #f3f4f6;
        }

        .modal-form {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
        }

        .form-group input, .form-group select {
          width: 100%;
          padding: 0.625rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.875rem;
        }

        .form-group input:focus, .form-group select:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .input-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 0 0.625rem;
        }

        .input-group input {
          border: none;
          padding: 0.625rem 0;
        }

        .input-group input:focus {
          box-shadow: none;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          background: #f3f4f6;
          color: #374151;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .btn-secondary:disabled, .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default ModalServicio;