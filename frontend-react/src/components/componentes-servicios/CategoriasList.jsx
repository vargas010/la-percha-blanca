import React from 'react';
import { Folder, Plus, Trash2 } from 'lucide-react';
import { deleteCategoria } from '../../api/client';
import toast from 'react-hot-toast';

function CategoriasList({ categorias, servicios, loading, onCategoriaClick, onNuevaCategoria, onRefresh }) {
  
  const handleDeleteCategoria = async (id, nombre, e) => {
    e.stopPropagation();
    const serviciosEnCategoria = servicios.filter(s => s.categoria_id === id).length;
    
    if (serviciosEnCategoria > 0) {
      toast.error(`No se puede eliminar "${nombre}" porque tiene ${serviciosEnCategoria} servicio(s) asociado(s)`);
      return;
    }
    
    if (confirm(`¿Estás seguro de eliminar la categoría "${nombre}"?`)) {
      try {
        await deleteCategoria(id);
        toast.success('🗑️ Categoría eliminada');
        onRefresh();
      } catch (error) {
        toast.error('❌ Error al eliminar categoría');
      }
    }
  };

  if (loading) {
    return (
      <div className="categorias-section">
        <div className="section-header">
          <h2><Folder className="section-icon" /> Categorías</h2>
          <button className="btn-primary" disabled><Plus size={18} /> Nueva Categoría</button>
        </div>
        <div className="loading-state">Cargando categorías...</div>
      </div>
    );
  }

  if (categorias.length === 0) {
    return (
      <div className="categorias-section">
        <div className="section-header">
          <h2><Folder className="section-icon" /> Categorías</h2>
          <button className="btn-primary" onClick={onNuevaCategoria}>
            <Plus size={18} /> Nueva Categoría
          </button>
        </div>
        <div className="empty-state">
          <Folder className="empty-icon" size={48} />
          <h3>No hay categorías</h3>
          <p>Crea tu primera categoría para organizar los servicios</p>
        </div>
      </div>
    );
  }

  return (
    <div className="categorias-section">
      <div className="section-header">
        <h2><Folder className="section-icon" /> Categorías</h2>
        <button className="btn-primary" onClick={onNuevaCategoria}>
          <Plus size={18} /> Nueva Categoría
        </button>
      </div>

      <div className="categorias-grid">
        {categorias.map(cat => {
          const serviciosCount = servicios.filter(s => s.categoria_id === cat.id).length;
          return (
            <div 
              key={cat.id} 
              className="categoria-card"
              onClick={() => onCategoriaClick(cat)}
            >
              <div className="card-header">
                <Folder className="card-icon" size={20} />
                <h4>{cat.nombre}</h4>
                <span className="servicios-count">{serviciosCount} servicios</span>
              </div>
              <p className="card-description">{cat.descripcion || 'Sin descripción'}</p>
              <div className="card-actions" onClick={e => e.stopPropagation()}>
                <button 
                  className="btn-danger-outline" 
                  onClick={(e) => handleDeleteCategoria(cat.id, cat.nombre, e)}
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .categorias-section {
          margin-bottom: 3rem;
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

        .btn-danger-outline {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.75rem;
          background: transparent;
          color: #dc2626;
          border: 1px solid #dc2626;
          border-radius: 6px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-danger-outline:hover {
          background: #dc2626;
          color: white;
        }

        .categorias-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .categoria-card {
          background: white;
          border-radius: 12px;
          padding: 1.25rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: all 0.2s;
          border: 2px solid transparent;
          cursor: pointer;
        }

        .categoria-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          border-color: #8b5cf6;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
        }

        .card-icon {
          color: #8b5cf6;
        }

        .card-header h4 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
        }

        .servicios-count {
          margin-left: auto;
          font-size: 0.75rem;
          color: #6b7280;
          background: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 20px;
        }

        .card-description {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0 0 1rem 0;
          line-height: 1.4;
        }

        .card-actions {
          display: flex;
          justify-content: flex-end;
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

export default CategoriasList;