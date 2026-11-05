import React, { useState } from 'react';
import { Icons } from './Icons';

function ModalClienteForm({ isOpen, onClose, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    email: '',
    permitir_entrega_con_deuda: false
  });
  const [formErrors, setFormErrors] = useState({});

  if (!isOpen) return null;

  const validateForm = () => {
    const errors = {};
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit(formData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      telefono: '',
      direccion: '',
      email: '',
      permitir_entrega_con_deuda: false
    });
    setFormErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-icon"><Icons.Star /></span>
            <h2>Nuevo Cliente</h2>
          </div>
          <button className="modal-close" onClick={handleClose}>
            <Icons.Close />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre completo *</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              placeholder="Ej: Juan Pérez García"
              className={formErrors.nombre ? 'error' : ''}
              autoFocus
              disabled={loading}
            />
            {formErrors.nombre && <span className="error-msg">{formErrors.nombre}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                placeholder="Ej: 555-123-4567"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="cliente@ejemplo.com"
                className={formErrors.email ? 'error' : ''}
                disabled={loading}
              />
              {formErrors.email && <span className="error-msg">{formErrors.email}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Dirección</label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => setFormData({...formData, direccion: e.target.value})}
              placeholder="Calle, número, colonia, ciudad"
              disabled={loading}
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.permitir_entrega_con_deuda}
                onChange={(e) => setFormData({...formData, permitir_entrega_con_deuda: e.target.checked})}
                disabled={loading}
              />
              <span className="checkbox-text">
                <strong>Permitir entrega con deuda</strong>
                <small>El cliente puede retirar su ropa aunque tenga saldo pendiente</small>
              </span>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={handleClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              <Icons.Save /> {loading ? 'Guardando...' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalClienteForm;