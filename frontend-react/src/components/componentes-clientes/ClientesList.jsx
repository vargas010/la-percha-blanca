import React from 'react';
import { Icons } from './Icons';

function ClientesList({ clientes, onVerDetalles }) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Contacto</th>
            <th>Dirección</th>
            <th>Política de pago</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td className="cliente-cell">
                <div className="cliente-info">
                  <div className="cliente-avatar">
                    {cliente.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="cliente-nombre">{cliente.nombre}</div>
                    <div className="cliente-id">ID: {cliente.id}</div>
                  </div>
                </div>
              </td>
              <td>
                {cliente.telefono ? (
                  <div className="contact-info">
                    <span className="contact-icon"><Icons.Phone /></span>
                    <span>{cliente.telefono}</span>
                  </div>
                ) : (
                  <span className="no-data">—</span>
                )}
                {cliente.email && (
                  <div className="contact-info small">
                    <span className="contact-icon"><Icons.Mail /></span>
                    <span>{cliente.email}</span>
                  </div>
                )}
              </td>
              <td>
                {cliente.direccion ? (
                  <div className="direccion-text">
                    <Icons.Location />
                    {cliente.direccion}
                  </div>
                ) : (
                  <span className="no-data">—</span>
                )}
              </td>
              <td>
                <span className={`deuda-badge ${cliente.permitir_entrega_con_deuda ? 'allowed' : 'not-allowed'}`}>
                  {cliente.permitir_entrega_con_deuda ? (
                    <><Icons.Unlock /> Entrega con deuda</>
                  ) : (
                    <><Icons.Lock /> Pago completo</>
                  )}
                </span>
              </td>
              <td>
                <button 
                  className="btn-detail"
                  onClick={() => onVerDetalles(cliente)}
                  title="Ver detalles"
                >
                  <Icons.Eye /> Ver detalles
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClientesList;