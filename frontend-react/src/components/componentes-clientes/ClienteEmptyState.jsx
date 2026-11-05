import React from 'react';
import { Icons } from './Icons';

function ClienteEmptyState({ hasSearch, onCrearCliente }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Icons.Users /></div>
      <h3>No hay clientes registrados</h3>
      <p>{hasSearch ? 'No se encontraron resultados para tu búsqueda' : 'Crea tu primer cliente para comenzar'}</p>
      <button className="btn-primary" onClick={onCrearCliente}>
        <Icons.Plus /> Crear cliente
      </button>
    </div>
  );
}

export default ClienteEmptyState;