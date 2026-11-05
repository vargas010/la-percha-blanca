import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { getClientes, createCliente } from '../api/client';
import ClienteHeader from './componentes-clientes/ClienteHeader';
import ClienteSearchBar from './componentes-clientes/ClienteSearchBar';
import ClientesList from './componentes-clientes/ClientesList';
import ClienteEmptyState from './componentes-clientes/ClienteEmptyState';
import ModalClienteForm from './componentes-clientes/ModalClienteForm';
import ModalClienteDetail from './componentes-clientes/ModalClienteDetail';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const clientesFiltrados = useMemo(() => {
    if (!searchTerm.trim()) return clientes;
    const term = searchTerm.toLowerCase();
    return clientes.filter(c => 
      c.nombre.toLowerCase().includes(term) ||
      (c.telefono && c.telefono.includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term))
    );
  }, [clientes, searchTerm]);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getClientes();
      setClientes(data || []);
    } catch (error) {
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateCliente = async (formData) => {
    try {
      await createCliente(formData);
      toast.success('Cliente creado exitosamente');
      setShowModal(false);
      cargarClientes();
    } catch (error) {
      toast.error(error.message || 'Error al crear cliente');
      throw error;
    }
  };

  const verDetalles = (cliente) => {
    setSelectedCliente(cliente);
    setShowDetailModal(true);
  };

  const handleEditar = (cliente) => {
    toast.info('Próximamente: Editar cliente');
    // Aquí puedes implementar la edición luego
  };

  if (loading && clientes.length === 0) {
    return (
      <div className="clientes-container">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Cargando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="clientes-container">
      <ClienteHeader 
        totalClientes={clientes.length} 
        onNuevoCliente={() => setShowModal(true)} 
      />

      <ClienteSearchBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
      />

      {clientesFiltrados.length === 0 ? (
        <ClienteEmptyState 
          hasSearch={!!searchTerm}
          onCrearCliente={() => setShowModal(true)}
        />
      ) : (
        <ClientesList 
          clientes={clientesFiltrados}
          onVerDetalles={verDetalles}
        />
      )}

      <ModalClienteForm 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateCliente}
        loading={loading}
      />

      <ModalClienteDetail 
        isOpen={showDetailModal}
        cliente={selectedCliente}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedCliente(null);
        }}
        onEditar={handleEditar}
      />

      <style>{`
        .clientes-container {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
          background: #f0f2f5;
          min-height: 100vh;
        }

        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .title-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .title-icon {
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          color: white;
        }

        .title-icon svg {
          stroke: white;
          width: 32px;
          height: 32px;
        }

        .title-section h1 {
          margin: 0;
          font-size: 1.8rem;
          color: #1e293b;
        }

        .subtitle {
          margin: 4px 0 0 0;
          color: #64748b;
          font-size: 0.9rem;
        }

        .btn-new {
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }

        .btn-new:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(30, 60, 114, 0.3);
        }

        .btn-new svg {
          stroke: white;
        }

        .search-bar {
          margin-bottom: 24px;
        }

        .search-input-wrapper {
          position: relative;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          display: flex;
          align-items: center;
        }

        .search-input-wrapper input {
          width: 100%;
          padding: 12px 16px 12px 42px;
          border: 2px solid #e2e8f0;
          border-radius: 14px;
          font-size: 0.95rem;
          background: white;
          color: #1e293b;
          transition: all 0.2s;
        }

        .search-input-wrapper input:focus {
          outline: none;
          border-color: #2a5298;
          box-shadow: 0 0 0 3px rgba(42, 82, 152, 0.1);
        }

        .clear-search {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
        }

        .clear-search svg {
          stroke: #94a3b8;
        }

        .clear-search:hover svg {
          stroke: #dc2626;
        }

        .table-container {
          background: white;
          border-radius: 20px;
          overflow-x: auto;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table thead th {
          text-align: left;
          padding: 16px 20px;
          background: #f8fafc;
          color: #1e293b;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e2e8f0;
        }

        .data-table tbody td {
          padding: 16px 20px;
          border-bottom: 1px solid #f0f0f0;
          color: #475569;
          vertical-align: middle;
        }

        .data-table tbody tr:hover {
          background: #f8fafc;
        }

        .cliente-cell {
          padding: 12px 20px !important;
        }

        .cliente-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cliente-avatar {
          width: 45px;
          height: 45px;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
          font-weight: bold;
        }

        .cliente-nombre {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .cliente-id {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .contact-info {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .contact-info.small {
          font-size: 0.8rem;
        }

        .contact-icon {
          display: flex;
          align-items: center;
          color: #64748b;
        }

        .direccion-text {
          display: flex;
          align-items: center;
          gap: 8px;
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .direccion-text svg {
          flex-shrink: 0;
          stroke: #64748b;
        }

        .no-data {
          color: #94a3b8;
          font-style: italic;
        }

        .deuda-badge {
          font-size: 0.75rem;
          padding: 5px 12px;
          border-radius: 20px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
        }

        .deuda-badge.allowed {
          background: #d4edda;
          color: #155724;
        }

        .deuda-badge.not-allowed {
          background: #f8d7da;
          color: #721c24;
        }

        .btn-detail {
          background: none;
          border: none;
          color: #2a5298;
          cursor: pointer;
          font-size: 0.85rem;
          padding: 6px 12px;
          border-radius: 8px;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn-detail:hover {
          background: #eef2ff;
          transform: translateX(2px);
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
        }

        .empty-icon {
          margin-bottom: 16px;
          opacity: 0.5;
          display: flex;
          justify-content: center;
        }

        .empty-icon svg {
          width: 64px;
          height: 64px;
          stroke: #64748b;
        }

        .empty-state h3 {
          margin: 0 0 8px 0;
          color: #1e293b;
        }

        .empty-state p {
          color: #64748b;
          margin-bottom: 24px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .loading-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 16px;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #2a5298;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: white;
          border-radius: 24px;
          width: 550px;
          max-width: 90%;
          max-height: 85vh;
          overflow-y: auto;
          animation: modalIn 0.3s ease;
        }

        .detail-modal {
          width: 500px;
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
          padding: 24px 28px;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
        }

        .modal-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .modal-icon {
          display: flex;
          align-items: center;
        }

        .modal-icon svg {
          stroke: white;
        }

        .modal-title h2 {
          margin: 0;
          font-size: 1.4rem;
        }

        .modal-close {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          cursor: pointer;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .modal-close svg {
          stroke: white;
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .detail-header {
          padding: 20px 24px;
        }

        .detail-avatar {
          width: 55px;
          height: 55px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          font-weight: bold;
        }

        .cliente-id-text {
          font-size: 0.8rem;
          opacity: 0.8;
          margin-top: 4px;
        }

        .detail-content {
          padding: 24px;
        }

        .detail-section {
          margin-bottom: 24px;
        }

        .detail-section h3 {
          margin: 0 0 12px 0;
          font-size: 1rem;
          color: #1e293b;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .detail-section h3 svg {
          stroke: #2a5298;
        }

        .detail-row {
          display: flex;
          margin-bottom: 10px;
        }

        .detail-label {
          width: 120px;
          font-weight: 600;
          color: #64748b;
          font-size: 0.85rem;
        }

        .detail-value {
          flex: 1;
          color: #1e293b;
        }

        .detail-value.full-width {
          width: 100%;
        }

        .detail-actions {
          border-top: 1px solid #e2e8f0;
          margin-top: 0;
        }

        .modal-content form {
          padding: 28px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #1e293b;
          font-size: 0.9rem;
        }

        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.95rem;
          color: #1e293b;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .form-group input:focus {
          outline: none;
          border-color: #2a5298;
          box-shadow: 0 0 0 3px rgba(42, 82, 152, 0.1);
        }

        .form-group input.error {
          border-color: #dc2626;
        }

        .error-msg {
          color: #dc2626;
          font-size: 0.8rem;
          margin-top: 6px;
          display: block;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .checkbox-group {
          margin: 24px 0;
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          cursor: pointer;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          transition: all 0.2s;
        }

        .checkbox-label:hover {
          background: #f1f5f9;
          border-color: #2a5298;
        }

        .checkbox-label input {
          width: 20px;
          height: 20px;
          margin-top: 2px;
          cursor: pointer;
        }

        .checkbox-text {
          flex: 1;
        }

        .checkbox-text strong {
          display: block;
          margin-bottom: 4px;
          color: #1e293b;
        }

        .checkbox-text small {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: normal;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }

        .btn-cancel {
          flex: 1;
          padding: 12px;
          background: #f1f5f9;
          border: none;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          color: #475569;
          transition: all 0.2s;
        }

        .btn-cancel:hover {
          background: #e2e8f0;
        }

        .btn-save {
          flex: 1;
          padding: 12px;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          border: none;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          color: white;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-save:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(30, 60, 114, 0.3);
        }

        .btn-save svg {
          stroke: white;
        }

        @media (max-width: 768px) {
          .clientes-container {
            padding: 16px;
          }

          .title-section h1 {
            font-size: 1.4rem;
          }

          .title-icon {
            width: 45px;
            height: 45px;
          }

          .title-icon svg {
            width: 24px;
            height: 24px;
          }

          .data-table thead th {
            font-size: 0.7rem;
            padding: 12px;
          }

          .data-table tbody td {
            padding: 12px;
          }

          .cliente-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .cliente-avatar {
            width: 35px;
            height: 35px;
            font-size: 0.9rem;
          }

          .btn-detail {
            font-size: 0.7rem;
            padding: 4px 8px;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .detail-row {
            flex-direction: column;
            gap: 4px;
          }

          .detail-label {
            width: auto;
          }
        }
      `}</style>
    </div>
  );
}

export default Clientes;