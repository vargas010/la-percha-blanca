import React from 'react';

function TablaPagos({ ordenes, loading, onPagar }) {
  return (
    <div className="table-container">
      <div className="table-responsive">
        <table className="ordenes-table">
          <thead>
            <tr>
              <th>Folio</th>
              <th>Cliente</th>
              <th className="amount">Total</th>
              <th className="amount">Pagado</th>
              <th className="amount saldo-col">Saldo</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map(orden => {
              const saldo = orden.total - orden.total_pagado;
              return (
                <tr key={orden.id} className="orden-row">
                  <td className="folio">
                    <span className="folio-number">#{orden.folio}</span>
                   </td>
                  <td className="cliente">
                    <strong>{orden.cliente_nombre}</strong>
                   </td>
                  <td className="amount">${orden.total.toFixed(2)}</td>
                  <td className="amount">${orden.total_pagado.toFixed(2)}</td>
                  <td className="amount saldo">
                    <span className={`saldo-value ${saldo > 0 ? 'debt' : 'paid'}`}>
                      ${saldo.toFixed(2)}
                    </span>
                   </td>
                  <td>
                    <button 
                      className="btn-pay" 
                      onClick={() => onPagar(orden.id)}
                      disabled={loading}
                    >
                      Pagar
                    </button>
                   </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TablaPagos;