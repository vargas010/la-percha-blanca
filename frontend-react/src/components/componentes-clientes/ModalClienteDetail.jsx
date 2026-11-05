import React from 'react';
import { Icons } from './Icons';

function ModalClienteDetail({ isOpen, cliente, onClose, onEditar }) {
  if (!isOpen || !cliente) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header detail-header">
          <div className="modal-title">
            <div className="detail-avatar">
              {cliente.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2>{cliente.nombre}</h2>
              <p className="cliente-id-text">ID: {cliente.id}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <Icons.Close />
          </button>
        </div>
        
        <div className="detail-content">
          <div className="detail-section">
            <h3><Icons.Phone /> Información de Contacto</h3>
            <div className="detail-row">
              <span className="detail-label">Teléfono:</span>
              <span className="detail-value">{cliente.telefono || 'No registrado'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{cliente.email || 'No registrado'}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3><Icons.Location /> Dirección</h3>
            <div className="detail-row">
              <span className="detail-value full-width">{cliente.direccion || 'No registrada'}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3><Icons.Settings /> Configuración</h3>
            <div className="detail-row">
              <span className="detail-label">Política de pago:</span>
              <span className={`deuda-badge ${cliente.permitir_entrega_con_deuda ? 'allowed' : 'not-allowed'}`}>
                {cliente.permitir_entrega_con_deuda ? (
                  <><Icons.Unlock /> Permite entrega con deuda</>
                ) : (
                  <><Icons.Lock /> Requiere pago completo</>
                )}
              </span>
            </div>
          </div>

          <div className="detail-section">
            <h3><Icons.Calendar /> Fechas</h3>
            <div className="detail-row">
              <span className="detail-label">Registrado:</span>
              <span className="detail-value">
                {cliente.created_at 
                  ? new Date(cliente.created_at).toLocaleDateString('es-MX')
                  : 'No disponible'}
              </span>
            </div>
          </div>
        </div>

        <div className="modal-actions detail-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cerrar
          </button>
          <button className="btn-save" onClick={() => onEditar(cliente)}>
            <Icons.Edit /> Editar Cliente
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalClienteDetail;