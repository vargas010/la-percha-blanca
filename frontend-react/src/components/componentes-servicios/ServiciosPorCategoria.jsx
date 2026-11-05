import React, { useState } from 'react';
import { Tag, ArrowLeft, Plus, DollarSign, Edit3, Trash2, Clock } from 'lucide-react';
import { updatePrecioServicio, deleteServicio } from '../../api/client';
import toast from 'react-hot-toast';

function ServiciosPorCategoria({ categoria, servicios, loading, onVolver, onRefresh, onNuevoServicio }) {
  const [editandoPrecio, setEditandoPrecio] = useState(null);

  const handleUpdatePrecio = async (id, nuevoPrecio) => {
    try {
      await updatePrecioServicio(id, parseFloat(nuevoPrecio));
      toast.success('💰 Precio actualizado');
      setEditandoPrecio(null);
      onRefresh();
    } catch (error) {
      toast.error('❌ Error al actualizar precio');
    }
  };

  const handleDeleteServicio = async (id, nombre) => {
    if (confirm(`¿Estás seguro de eliminar el servicio "${nombre}"?`)) {
      try {
        await deleteServicio(id);
        toast.success('🗑️ Servicio eliminado');
        onRefresh();
      } catch (error) {
        toast.error('❌ Error al eliminar servicio');
      }
    }
  };

  if (loading) {
    return <div className="loading-state">Cargando servicios...</div>;
  }

  if (servicios.length === 0) {
    return (
      <div className="servicios-categoria-section">
        <div className="section-header">
          <h2>
            <Tag className="section-icon" />
            Servicios de {categoria.nombre}
          </h2>
          <button className="btn-back" onClick={onVolver}>
            <ArrowLeft size={18} />
            Ver todos los servicios
          </button>
        </div>
        <div className="empty-state">
          <Tag className="empty-icon" size={48} />
          <h3>No hay servicios en esta categoría</h3>
          <button className="btn-primary" onClick={onNuevoServicio}>
            <Plus size={18} />
            Crear primer servicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="servicios-categoria-section">
      <div className="section-header">
        <h2>
          <Tag className="section-icon" />
          Servicios de {categoria.nombre}
          <span className="servicios-count-badge">{servicios.length} servicios</span>
        </h2>
        <div className="header-actions">
          <button className="btn-back" onClick={onVolver}>
            <ArrowLeft size={18} />
            Ver todos los servicios
          </button>
          <button className="btn-primary" onClick={onNuevoServicio}>
            <Plus size={18} />
            Nuevo Servicio
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="servicios-table">
          <thead>
            <tr>
              <th>Servicio</th>
              <th className="price-col">Precio</th>
              <th className="time-col">Tiempo</th>
              <th className="actions-col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {servicios.map(serv => (
              <tr key={serv.id}>
                <td className="servicio-cell">
                  <div className="servicio-info">
                    <strong>{serv.nombre}</strong>
                  </div>
                </td>
                <td className="price-cell">
                  {editandoPrecio === serv.id ? (
                    <div className="price-editor">
                      <DollarSign size={16} className="price-icon" />
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={serv.precio_base}
                        onBlur={(e) => handleUpdatePrecio(serv.id, e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleUpdatePrecio(serv.id, e.target.value)}
                        autoFocus
                        className="price-input"
                      />
                    </div>
                  ) : (
                    <button 
                      className="price-display"
                      onClick={() => setEditandoPrecio(serv.id)}
                    >
                      <DollarSign size={16} />
                      {serv.precio_base.toFixed(2)}
                      <Edit3 size={14} className="edit-icon" />
                    </button>
                  )}
                </td>
                <td className="time-cell">
                  <Clock size={16} />
                  {serv.tiempo_estimado} min
                </td>
                <td className="actions-cell">
                  <button 
                    className="btn-delete"
                    onClick={() => handleDeleteServicio(serv.id, serv.nombre)}
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .servicios-categoria-section {
          margin-top: 2rem;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .section-header h2 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
        }

        .section-icon {
          color: #10b981;
        }

        .servicios-count-badge {
          background: #8b5cf6;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #f3f4f6;
          color: #374151;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-back:hover {
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

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .table-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          overflow-x: auto;
        }

        .servicios-table {
          width: 100%;
          border-collapse: collapse;
        }

        .servicios-table th {
          background: #f9fafb;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .servicios-table td {
          padding: 1rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .price-cell {
          width: 130px;
        }

        .price-display {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.75rem;
          background: #f3f4f6;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .price-display:hover {
          background: #e5e7eb;
        }

        .edit-icon {
          opacity: 0.5;
        }

        .price-editor {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .price-input {
          width: 100px;
          padding: 0.375rem 0.5rem;
          border: 2px solid #10b981;
          border-radius: 6px;
          font-weight: 600;
        }

        .time-cell {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .actions-cell {
          width: 100px;
        }

        .btn-delete {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.75rem;
          background: #fee2e2;
          color: #dc2626;
          border: none;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-delete:hover {
          background: #dc2626;
          color: white;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 12px;
          color: #6b7280;
        }

        .empty-icon {
          margin-bottom: 1rem;
          color: #d1d5db;
        }

        .loading-state {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}

export default ServiciosPorCategoria;