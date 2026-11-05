import React, { useState } from 'react';
import { Folder, Plus, X } from 'lucide-react';
import { createCategoria } from '../../api/client';
import toast from 'react-hot-toast';

function ModalCategoria({ isOpen, onClose, onSuccess }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createCategoria(nombre, descripcion);
      toast.success('✅ Categoría creada exitosamente');
      setNombre('');
      setDescripcion('');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('❌ Error al crear categoría');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <Folder size={24} />
            <h3>Nueva Categoría</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre *</label>
            <input
              id="nombre"
              type="text"
              required
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Lavado, Planchado, Tinte..."
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              rows="3"
              placeholder="Descripción opcional de la categoría..."
              disabled={loading}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Plus size={18} />
              {loading ? 'Creando...' : 'Crear Categoría'}
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

        .form-group input, .form-group textarea {
          width: 100%;
          padding: 0.625rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.875rem;
        }

        .form-group input:focus, .form-group textarea:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
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
      `}</style>
    </div>
  );
}

export default ModalCategoria;