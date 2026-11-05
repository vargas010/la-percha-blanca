import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getOrdenes, actualizarEstado } from '../api/client';

const estados = ['ingresado', 'en_lavado', 'en_planchado', 'listo', 'entregado'];

function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarOrdenes();
  }, []);

  const cargarOrdenes = async () => {
    try {
      const data = await getOrdenes();
      setOrdenes(data);
    } catch (error) {
      toast.error('Error cargando órdenes');
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await actualizarEstado(id, nuevoEstado);
      toast.success(`Estado actualizado a ${nuevoEstado}`);
      cargarOrdenes();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="card">
      <h3>📋 Lista de Órdenes</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Folio</th>
            <th>Cliente</th>
            <th>Fecha Ingreso</th>
            <th>Fecha Prometida</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ordenes.map(orden => (
            <tr key={orden.id}>
              <td>{orden.folio}</td>
              <td>{orden.cliente_nombre}</td>
              <td>{new Date(orden.fecha_ingreso).toLocaleDateString()}</td>
              <td>{new Date(orden.fecha_prometida).toLocaleDateString()}</td>
              <td>${orden.total}</td>
              <td>
                <span className={`estado-badge estado-${orden.estado_ropa}`}>
                  {orden.estado_ropa}
                </span>
              </td>
              <td>
                <select
                  value={orden.estado_ropa}
                  onChange={(e) => cambiarEstado(orden.id, e.target.value)}
                  className="btn-secondary"
                  style={{ padding: '5px 10px' }}
                >
                  {estados.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Ordenes;