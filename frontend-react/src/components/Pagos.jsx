import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getOrdenes, getOrdenCompleta, registrarPago } from '../api/client';
import { DollarSign } from 'lucide-react';
import MonedaSelector from './componentes-pagos/MonedaSelector';
import TablaPagos from './componentes-pagos/TablaPagos';
import ModalPago from './componentes-pagos/ModalPago';

function Pagos() {
  const [ordenes, setOrdenes] = useState([]);
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [monto, setMonto] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [referencia, setReferencia] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState('BOB'); // 'BOB' o 'USD'

  // Tasas de cambio
  const BOB_TO_USD = 0.144;
  const USD_TO_BOB = 6.96;

  useEffect(() => {
    cargarOrdenes();
  }, []);

  const cargarOrdenes = useCallback(async () => {
    try {
      const data = await getOrdenes();
      const conDeuda = data.filter(o => o.total_pagado < o.total && o.estado_ropa !== 'entregado');
      setOrdenes(conDeuda);
    } catch {
      toast.error('Error al cargar órdenes');
    }
  }, []);

  const handleSelectOrden = async (ordenId) => {
    try {
      setLoading(true);
      const data = await getOrdenCompleta(ordenId);
      setSelectedOrden(data);
      setMonto('');
      setMetodoPago('efectivo');
      setReferencia('');
      setShowModal(true);
    } catch {
      toast.error('Error al cargar orden');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const saldo = selectedOrden.orden.total - selectedOrden.orden.total_pagado;
    const montoNum = parseFloat(monto);
    
    if (montoNum > saldo) {
      toast.error(`El monto no puede exceder el saldo pendiente (${formatCurrency(saldo)})`);
      return;
    }

    try {
      setLoading(true);
      await registrarPago(selectedOrden.orden.id, montoNum, metodoPago, referencia);
      toast.success('✅ Pago registrado');
      setShowModal(false);
      setSelectedOrden(null);
      cargarOrdenes();
    } catch {
      toast.error('❌ Error al registrar pago');
    } finally {
      setLoading(false);
    }
  };

  // Función para convertir moneda
  const convertCurrency = (amount) => {
    if (currency === 'BOB') {
      return amount;
    } else {
      return amount * BOB_TO_USD;
    }
  };

  // Función para formatear moneda
  const formatCurrency = (value) => {
    const convertedValue = convertCurrency(value);
    const symbol = currency === 'BOB' ? 'Bs.' : '$';
    
    return new Intl.NumberFormat(currency === 'BOB' ? 'es-BO' : 'en-US', {
      style: 'currency',
      currency: currency === 'BOB' ? 'BOB' : 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(convertedValue).replace(currency === 'BOB' ? 'BOB' : 'USD', symbol);
  };

  const saldoPendiente = selectedOrden 
    ? selectedOrden.orden.total - selectedOrden.orden.total_pagado 
    : 0;

  if (ordenes.length === 0) {
    return (
      <div className="empty-state">
        <DollarSign className="empty-icon" />
        <h3>No hay pagos pendientes</h3>
        <p>Todas las órdenes están al día o entregadas</p>
        <style>{cssStyles}</style>
      </div>
    );
  }

  return (
    <div className="pagos-container">
      <div className="header">
        <h2>
          <DollarSign className="header-icon" size={24} />
          Registrar Pagos
        </h2>
        <div className="header-actions">
          <MonedaSelector currency={currency} onCurrencyChange={setCurrency} />
          <div className="stats">
            <div className="stat">
              <span className="stat-number">{ordenes.length}</span>
              <span className="stat-label">órdenes pendientes</span>
            </div>
          </div>
        </div>
      </div>

      <TablaPagos 
        ordenes={ordenes} 
        loading={loading} 
        onPagar={handleSelectOrden} 
      />

      {showModal && selectedOrden && (
        <ModalPago
          orden={selectedOrden.orden}
          monto={monto}
          setMonto={setMonto}
          metodoPago={metodoPago}
          setMetodoPago={setMetodoPago}
          referencia={referencia}
          setReferencia={setReferencia}
          saldoPendiente={saldoPendiente}
          onClose={() => {
            setShowModal(false);
            setSelectedOrden(null);
          }}
          onSubmit={handleSubmit}
          loading={loading}
        />
      )}

      <style>{cssStyles}</style>
    </div>
  );
}

// Estilos CSS corregidos (colores más oscuros para mejor legibilidad)
const cssStyles = `
  .pagos-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    background: #f0f2f5;
    min-height: 100vh;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .header h2 {
    margin: 0;
    color: #1e293b;
    font-size: 1.75rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .header-icon { color: #10b981; }
  .header-actions { display: flex; align-items: center; gap: 1rem; }

  .currency-selector {
    display: flex;
    gap: 8px;
    background: white;
    padding: 4px;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .currency-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    background: transparent;
    color: #64748b;
  }

  .currency-btn.active {
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    color: white;
  }

  .currency-btn:hover:not(.active) {
    background: #f1f5f9;
  }

  .stats { display: flex; gap: 2rem; }
  .stat { text-align: center; }
  .stat-number { display: block; font-size: 1.5rem; font-weight: 700; color: #10b981; }
  .stat-label { font-size: 0.875rem; color: #1e293b; font-weight: 500; }

  .table-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    overflow: hidden;
  }

  .table-responsive { overflow-x: auto; }
  .ordenes-table { width: 100%; border-collapse: collapse; }
  
  .ordenes-table th {
    background: #f8fafc;
    padding: 1rem 1.25rem;
    text-align: left;
    font-weight: 600;
    color: #1e293b;
    font-size: 0.875rem;
    border-bottom: 2px solid #e2e8f0;
  }

  .ordenes-table td {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
  }

  .orden-row:hover { background: #f8fafc; }
  .folio-number { font-weight: 600; color: #1e293b; }
  .amount { text-align: right; font-weight: 500; font-family: monospace; color: #1e293b; }
  .saldo-col { width: 120px; }
  .saldo-value.debt { color: #dc2626; font-weight: 700; }
  .saldo-value.paid { color: #059669; font-weight: 700; }

  .btn-pay {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.875rem;
  }

  .btn-pay:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }

  .btn-pay:disabled { opacity: 0.6; cursor: not-allowed; }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: 20px;
    color: #1e293b;
  }

  .empty-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 1rem;
    color: #94a3b8;
  }

  .empty-state h3 { color: #1e293b; margin-bottom: 0.5rem; }
  .empty-state p { color: #64748b; }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal-content {
    background: white;
    border-radius: 16px;
    width: min(90vw, 520px);
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 1.5rem 0;
    margin-bottom: 1rem;
  }

  .modal-header h3 { margin: 0; color: #1e293b; font-size: 1.25rem; font-weight: 600; }

  .close-btn {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .close-btn:hover { background: #f1f5f9; color: #1e293b; }

  .orden-info {
    padding: 0 1.5rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
    border-radius: 12px;
    margin: 0 1.5rem 1.5rem;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
    color: #334155;
  }

  .resumen {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
  }

  .resumen-item {
    display: flex;
    justify-content: space-between;
    font-size: 0.95rem;
    color: #334155;
  }

  .resumen-item:last-child {
    grid-column: 1 / -1;
    font-weight: 700;
    font-size: 1.1rem;
    color: #dc2626;
  }

  .pago-form { padding: 0 1.5rem 1.5rem; }
  .form-group { margin-bottom: 1.5rem; }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #1e293b;
    font-size: 0.9rem;
  }

  .input-group {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .input-icon { color: #10b981; flex-shrink: 0; }

  .input-monto, input[type="text"] {
    flex: 1;
    padding: 0.875rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    font-size: 1rem;
    transition: all 0.2s;
    background: white;
    color: #1e293b;
  }

  .input-monto:focus, input[type="text"]:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }

  .max-saldo { font-size: 0.85rem; color: #64748b; white-space: nowrap; }

  .metodos-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
  }

  .metodo-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    border: 2px solid #e2e8f0;
    background: white;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
    font-weight: 500;
    color: #1e293b;
  }

  .metodo-btn:hover:not(:disabled) {
    border-color: #10b981;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.15);
  }

  .metodo-btn.active {
    border-color: #10b981;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
  }

  .btn-cancel, .btn-confirm {
    flex: 1;
    padding: 1rem;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.95rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-cancel { background: #f1f5f9; color: #334155; }
  .btn-cancel:hover:not(:disabled) { background: #e2e8f0; }

  .btn-confirm {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
  }

  .btn-confirm:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  }

  .btn-confirm:disabled, .btn-cancel:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    .pagos-container { padding: 1rem; }
    .header { flex-direction: column; align-items: flex-start; gap: 1rem; }
    .header-actions { width: 100%; justify-content: space-between; }
    .stats { width: 100%; justify-content: space-around; }
  }

  @media (max-width: 480px) {
    .resumen { grid-template-columns: 1fr; }
    .metodos-container { grid-template-columns: repeat(2, 1fr); }
  }
`;

export default Pagos;