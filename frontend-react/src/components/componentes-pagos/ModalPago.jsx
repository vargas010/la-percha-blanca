import React from 'react';
import { X, DollarSign, CreditCard, Landmark, QrCode } from 'lucide-react';

function ModalPago({ 
  orden, monto, setMonto, metodoPago, setMetodoPago, 
  referencia, setReferencia, saldoPendiente, onClose, onSubmit, loading 
}) {
  const metodos = [
    { value: 'efectivo', label: 'Efectivo', icon: DollarSign },
    { value: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
    { value: 'transferencia', label: 'Transferencia', icon: Landmark },
    { value: 'qr', label: 'QR', icon: QrCode },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>💳 Registrar Pago</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="orden-info">
          <div className="info-row">
            <span>Folio:</span>
            <strong>#{orden.folio}</strong>
          </div>
          <div className="info-row">
            <span>Cliente:</span>
            <strong>{orden.cliente_nombre}</strong>
          </div>
          <div className="resumen">
            <div className="resumen-item">
              <span>Total:</span>
              <span>${orden.total.toFixed(2)}</span>
            </div>
            <div className="resumen-item">
              <span>Pagado:</span>
              <span>${orden.total_pagado.toFixed(2)}</span>
            </div>
            <div className="resumen-item saldo-pendiente">
              <span>Saldo:</span>
              <span>${saldoPendiente.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="pago-form">
          <div className="form-group">
            <label>Monto a pagar *</label>
            <div className="input-group">
              <DollarSign size={18} className="input-icon" />
              <input
                type="number"
                step="0.01"
                min="0"
                max={saldoPendiente}
                required
                value={monto}
                onChange={e => setMonto(e.target.value)}
                placeholder="0.00"
                className="input-monto"
                disabled={loading}
              />
              <span className="max-saldo">Máx: ${saldoPendiente.toFixed(2)}</span>
            </div>
          </div>

          <div className="form-group">
            <label>Método de pago *</label>
            <div className="metodos-container">
              {metodos.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  className={`metodo-btn ${metodoPago === value ? 'active' : ''}`}
                  onClick={() => setMetodoPago(value)}
                  disabled={loading}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Referencia (opcional)</label>
            <input
              type="text"
              value={referencia}
              onChange={e => setReferencia(e.target.value)}
              placeholder="Número de transacción, últimos 4 dígitos, etc."
              disabled={loading}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-confirm" disabled={loading || !monto}>
              {loading ? 'Procesando...' : `Pagar $${parseFloat(monto || 0).toFixed(2)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalPago;