import React, { useState } from 'react';
import { Tag, Plus, DollarSign, Edit3, Trash2, Clock } from 'lucide-react';
import { updatePrecioServicio, deleteServicio } from '../../api/client';
import toast from 'react-hot-toast';

function ServiciosTable({ servicios, loading, onRefresh, onNuevoServicio }) {
  const [editandoPrecio, setEditandoPrecio] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServicios = servicios.filter(servicio =>
    servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    servicio.categoria_nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    return (
      <div className="servicios-section">
        <div className="section-header">
          <h2><Tag className="section-icon" /> Servicios</h2>
          <button className="btn-primary" disabled><Plus size={18} /> Nuevo Servicio</button>
        </div>
        <div className="loading-state">Cargando servicios...</div>
      </div>
    );
  }

  return (
    <div className="servicios-section">
      <div className="section-header">
        <h2><Tag className="section-icon" /> Servicios</h2>
        <div className="header-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar servicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="btn-primary" onClick={onNuevoServicio}>
            <Plus size={18} />
            Nuevo Servicio
          </button>
        </div>
      </div>

      {filteredServicios.length === 0 ? (
        <div className="empty-state">
          <Tag className="empty-icon" size={48} />
          <h3>No hay servicios {searchTerm && 'que coincidan con la búsqueda'}</h3>
          <p>¡Crea tu primer servicio o ajusta tu búsqueda!</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="servicios-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Servicio</th>
                <th className="price-col">Precio</th>
                <th className="time-col">Tiempo</th>
                <th className="actions-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredServicios.map(serv => (
                <tr key={serv.id}>
                  <td className="categoria-cell">
                    <span className="categoria-badge">{serv.categoria_nombre}</span>
                  </td>
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
      )}

      <style jsx>{`
        .servicios-section {
          margin-top: 2rem;
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

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .search-container {
          position: relative;
        }

        .search-input {
          padding: 0.5rem 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.875rem;
          width: 250px;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
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

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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

        .categoria-badge {
          background: #f3e8ff;
          color: #7e22ce;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
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

        @media (max-width: 768px) {
          .search-input {
            width: 180px;
          }

          .header-actions {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default ServiciosTable;