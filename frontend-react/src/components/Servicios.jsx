import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Tag } from 'lucide-react';
import { getCategorias, getServicios } from '../api/client';
import CategoriasList from './componentes-servicios/CategoriasList';
import ServiciosTable from './componentes-servicios/ServiciosTable';
import ServiciosPorCategoria from './componentes-servicios/ServiciosPorCategoria';
import ModalCategoria from './componentes-servicios/ModalCategoria';
import ModalServicio from './componentes-servicios/ModalServicio';

function Servicios() {
  const [categorias, setCategorias] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [showServicioModal, setShowServicioModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      const [cats, servs] = await Promise.all([getCategorias(), getServicios()]);
      setCategorias(cats);
      setServicios(servs);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCategoriaClick = (categoria) => {
    setCategoriaSeleccionada(categoria);
  };

  const handleVolverATodas = () => {
    setCategoriaSeleccionada(null);
  };

  const refreshData = () => {
    cargarDatos();
  };

  return (
    <div className="servicios-container">
      <div className="header">
        <div>
          <h1>
            <Tag className="header-icon" size={28} />
            Gestión de Servicios
          </h1>
          <p className="header-subtitle">Organiza tus servicios y categorías de manera eficiente</p>
        </div>
      </div>

      {/* Lista de Categorías */}
      <CategoriasList
        categorias={categorias}
        servicios={servicios}
        loading={loading}
        onCategoriaClick={handleCategoriaClick}
        onNuevaCategoria={() => setShowCategoriaModal(true)}
        onRefresh={refreshData}
      />

      {/* Vista de Servicios */}
      {categoriaSeleccionada ? (
        <ServiciosPorCategoria
          categoria={categoriaSeleccionada}
          servicios={servicios.filter(s => s.categoria_id === categoriaSeleccionada.id)}
          loading={loading}
          onVolver={handleVolverATodas}
          onRefresh={refreshData}
          onNuevoServicio={() => setShowServicioModal(true)}
        />
      ) : (
        <ServiciosTable
          servicios={servicios}
          loading={loading}
          onRefresh={refreshData}
          onNuevoServicio={() => setShowServicioModal(true)}
        />
      )}

      {/* Modales */}
      <ModalCategoria
        isOpen={showCategoriaModal}
        onClose={() => setShowCategoriaModal(false)}
        onSuccess={refreshData}
      />

      <ModalServicio
        isOpen={showServicioModal}
        onClose={() => setShowServicioModal(false)}
        onSuccess={refreshData}
        categorias={categorias}
      />

      <style jsx>{`
        .servicios-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .header {
          text-align: center;
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .header h1 {
          color: #1f2937;
          font-size: 2.25rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .header-icon {
          color: #8b5cf6;
        }

        .header-subtitle {
          color: #6b7280;
          font-size: 1.125rem;
          margin: 0;
        }

        @media (max-width: 768px) {
          .servicios-container {
            padding: 1rem;
          }

          .header h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}

export default Servicios;