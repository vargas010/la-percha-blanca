import React from 'react';
import { Icons } from './Icons';

function ClienteHeader({ totalClientes, onNuevoCliente }) {
  return (
    <div className="header-section">
      <div className="title-section">
        <div className="title-icon">
          <Icons.Users />
        </div>
        <div>
          <h1>Clientes</h1>
          <p className="subtitle">
            {totalClientes} cliente{totalClientes !== 1 ? 's' : ''} registrado{totalClientes !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      <button className="btn-new" onClick={onNuevoCliente}>
        <Icons.Plus />
        Nuevo Cliente
      </button>
    </div>
  );
}

export default ClienteHeader;