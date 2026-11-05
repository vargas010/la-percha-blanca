import React, { useState, useEffect, useCallback } from 'react';
import { getOrdenes, getServicios, getClientes } from '../api/client';
import toast from 'react-hot-toast';
import { 
  LayoutDashboard, 
  RefreshCw, 
  ClipboardList, 
  Users, 
  DollarSign, 
  Package, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  FileText,
  CreditCard
} from 'lucide-react';

function Dashboard() {
  const [stats, setStats] = useState({
    ordenesPendientes: 0,
    totalClientes: 0,
    totalServicios: 0,
    gananciasHoy: 0,
    ultimasOrdenes: [],
    totalOrdenes: 0,
    ordenesPorEstado: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currency, setCurrency] = useState('BOB'); // 'BOB' o 'USD'
  const [exchangeRate, setExchangeRate] = useState(6.96); // Tasa de cambio por defecto BOB a USD

  // Tasa de cambio fija (puedes ajustarla o obtenerla de una API)
  const BOB_TO_USD = 0.144; // 1 BOB = 0.144 USD aproximadamente
  const USD_TO_BOB = 6.96; // 1 USD = 6.96 BOB

  const cargarDashboard = useCallback(async () => {
    try {
      setRefreshing(true);
      const [ordenes, servicios, clientes] = await Promise.all([
        getOrdenes(),
        getServicios(),
        getClientes()
      ]);

      const ordenesPendientes = ordenes.filter(o => o.estado_ropa !== 'entregado').length;
      const totalOrdenes = ordenes.length;
      
      const hoy = new Date().toDateString();
      const gananciasHoy = ordenes
        .filter(o => {
          const fecha = o.fecha_entrega ? new Date(o.fecha_entrega) : new Date(o.fecha_ingreso);
          return fecha.toDateString() === hoy && o.estado_pago === 'pagado';
        })
        .reduce((sum, o) => sum + (o.total || 0), 0);

      const ordenesPorEstado = calcularOrdenesPorEstado(ordenes);

      setStats({
        ordenesPendientes,
        totalClientes: clientes.length,
        totalServicios: servicios.length,
        gananciasHoy,
        ultimasOrdenes: ordenes.slice(0, 5),
        totalOrdenes,
        ordenesPorEstado
      });
      
      toast.success('Dashboard actualizado');
    } catch (error) {
      console.error('Error cargando dashboard:', error);
      toast.error('Error al cargar dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const calcularOrdenesPorEstado = (ordenes) => {
    const estados = {
      'ingresado': { name: 'Ingresado', color: '#f39c12', icon: Clock, count: 0 },
      'en_lavado': { name: 'En Lavado', color: '#3498db', icon: RefreshCw, count: 0 },
      'en_planchado': { name: 'En Planchado', color: '#9b59b6', icon: TrendingUp, count: 0 },
      'listo': { name: 'Listo', color: '#27ae60', icon: CheckCircle, count: 0 },
      'entregado': { name: 'Entregado', color: '#95a5a6', icon: Package, count: 0 }
    };
    
    ordenes.forEach(orden => {
      if (estados[orden.estado_ropa]) {
        estados[orden.estado_ropa].count++;
      }
    });
    
    return Object.values(estados);
  };

  useEffect(() => {
    cargarDashboard();
  }, [cargarDashboard]);

  // Función para convertir moneda
  const convertCurrency = (amount, fromCurrency = 'BOB') => {
    if (currency === 'BOB') {
      return amount;
    } else {
      // Convertir a USD
      return amount * BOB_TO_USD;
    }
  };

  const formatCurrency = (value) => {
    const convertedValue = convertCurrency(value);
    const symbol = currency === 'BOB' ? 'Bs.' : '$';
    const locale = currency === 'BOB' ? 'es-BO' : 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency === 'BOB' ? 'BOB' : 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(convertedValue).replace(currency === 'BOB' ? 'BOB' : 'USD', symbol);
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      'ingresado': 'Ingresado',
      'en_lavado': 'En Lavado',
      'en_planchado': 'En Planchado',
      'listo': 'Listo',
      'entregado': 'Entregado'
    };
    return textos[estado] || estado;
  };

  const getEstadoIcon = (estado) => {
    const icons = {
      'ingresado': Clock,
      'en_lavado': RefreshCw,
      'en_planchado': TrendingUp,
      'listo': CheckCircle,
      'entregado': Package
    };
    const IconComponent = icons[estado] || ClipboardList;
    return <IconComponent size={14} />;
  };

  const totalOrdenesEstado = stats.ordenesPorEstado.reduce((sum, e) => sum + e.count, 0);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <div className="title-with-icon">
            <LayoutDashboard size={28} className="title-icon" />
            <div>
              <h1>Dashboard</h1>
              <p>Resumen de La Percha Blanca</p>
            </div>
          </div>
        </div>
        <div className="header-actions">
          {/* Selector de moneda */}
          <div className="currency-selector">
            <button 
              className={`currency-btn ${currency === 'BOB' ? 'active' : ''}`}
              onClick={() => setCurrency('BOB')}
            >
              Bs. BOB
            </button>
            <button 
              className={`currency-btn ${currency === 'USD' ? 'active' : ''}`}
              onClick={() => setCurrency('USD')}
            >
              $ USD
            </button>
          </div>
          <button 
            className="refresh-btn"
            onClick={cargarDashboard}
            disabled={refreshing}
          >
            <RefreshCw size={18} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderTop: '4px solid #f39c12' }}>
          <div className="stat-icon" style={{ background: '#f39c12' }}>
            <ClipboardList size={28} color="white" />
          </div>
          <div className="stat-content">
            <h3>Órdenes Pendientes</h3>
            <p className="stat-value">{stats.ordenesPendientes}</p>
          </div>
        </div>
        
        <div className="stat-card" style={{ borderTop: '4px solid #3498db' }}>
          <div className="stat-icon" style={{ background: '#3498db' }}>
            <Users size={28} color="white" />
          </div>
          <div className="stat-content">
            <h3>Clientes Totales</h3>
            <p className="stat-value">{stats.totalClientes}</p>
          </div>
        </div>
        
        <div className="stat-card" style={{ borderTop: '4px solid #27ae60' }}>
          <div className="stat-icon" style={{ background: '#27ae60' }}>
            <DollarSign size={28} color="white" />
          </div>
          <div className="stat-content">
            <h3>Ganancias Hoy</h3>
            <p className="stat-value">{formatCurrency(stats.gananciasHoy)}</p>
          </div>
        </div>
        
        <div className="stat-card" style={{ borderTop: '4px solid #9b59b6' }}>
          <div className="stat-icon" style={{ background: '#9b59b6' }}>
            <Package size={28} color="white" />
          </div>
          <div className="stat-content">
            <h3>Total Órdenes</h3>
            <p className="stat-value">{stats.totalOrdenes}</p>
          </div>
        </div>
      </div>

      {/* Gráfico de barras de estados */}
      <div className="chart-card">
        <div className="chart-header">
          <TrendingUp size={22} />
          <h3>Órdenes por Estado</h3>
        </div>
        <div className="estados-bars">
          {stats.ordenesPorEstado.map(estado => (
            estado.count > 0 && (
              <div key={estado.name} className="estado-bar-item">
                <div className="estado-bar-label">
                  <span className="estado-dot" style={{ backgroundColor: estado.color }}></span>
                  <span>{estado.name}</span>
                  <span className="estado-count">{estado.count}</span>
                </div>
                <div className="estado-bar-bg">
                  <div 
                    className="estado-bar-fill" 
                    style={{ 
                      width: `${(estado.count / totalOrdenesEstado) * 100}%`,
                      backgroundColor: estado.color 
                    }}
                  >
                    {((estado.count / totalOrdenesEstado) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Tabla de últimas órdenes */}
      <div className="recent-orders-card">
        <div className="card-header">
          <div className="card-header-title">
            <FileText size={20} />
            <h3>Últimas Órdenes</h3>
          </div>
          <span className="orders-count">{stats.ultimasOrdenes.length} órdenes recientes</span>
        </div>
        <div className="orders-table">
          {stats.ultimasOrdenes.length === 0 ? (
            <div className="empty-orders">
              <Package size={48} stroke="#ccc" />
              <p>No hay órdenes registradas</p>
            </div>
          ) : (
            stats.ultimasOrdenes.map(orden => (
              <div key={orden.id} className="order-row">
                <div className="order-info">
                  <div className="order-folio">#{orden.folio}</div>
                  <div className="order-client">
                    <User size={12} />
                    {orden.cliente_nombre}
                  </div>
                  <div className="order-date">
                    <Calendar size={12} />
                    {new Date(orden.fecha_ingreso).toLocaleDateString()}
                  </div>
                </div>
                <div className="order-details">
                  <div className="order-total">{formatCurrency(orden.total || 0)}</div>
                  <span className={`estado-badge estado-${orden.estado_ropa}`}>
                    {getEstadoIcon(orden.estado_ropa)}
                    {getEstadoTexto(orden.estado_ropa)}
                  </span>
                  <span className={`pago-badge pago-${orden.estado_pago}`}>
                    <CreditCard size={12} />
                    {orden.estado_pago === 'pagado' ? 'Pagado' : 
                     orden.estado_pago === 'parcial' ? 'Parcial' : 'Pendiente'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .dashboard {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
          background: #f0f2f5;
          min-height: 100vh;
        }
        
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .title-with-icon {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .title-icon {
          color: #2a5298;
        }
        
        .dashboard-header h1 {
          margin: 0 0 8px 0;
          font-size: 1.8rem;
          color: #1e293b;
        }
        
        .dashboard-header p {
          color: #64748b;
          margin: 0;
          font-size: 0.9rem;
        }
        
        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        
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
        
        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .refresh-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(30, 60, 114, 0.3);
        }
        
        .refresh-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }
        
        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          display: flex;
          gap: 16px;
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
        }
        
        .stat-icon {
          width: 55px;
          height: 55px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
        }
        
        .stat-content h3 {
          margin: 0 0 8px 0;
          color: #64748b;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .stat-value {
          margin: 0;
          font-size: 1.8rem;
          font-weight: bold;
          color: #1e293b;
        }
        
        .chart-card {
          background: white;
          padding: 24px;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          margin-bottom: 32px;
        }
        
        .chart-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        
        .chart-header h3 {
          margin: 0;
          color: #1e293b;
          font-size: 1.2rem;
        }
        
        .estados-bars {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .estado-bar-item {
          width: 100%;
        }
        
        .estado-bar-label {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
          font-size: 0.9rem;
          color: #475569;
        }
        
        .estado-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        
        .estado-count {
          margin-left: auto;
          font-weight: bold;
          color: #1e293b;
        }
        
        .estado-bar-bg {
          background: #f1f5f9;
          border-radius: 12px;
          height: 32px;
          overflow: hidden;
        }
        
        .estado-bar-fill {
          height: 100%;
          border-radius: 12px;
          transition: width 0.5s ease;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 12px;
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        .recent-orders-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          overflow: hidden;
        }
        
        .card-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .card-header-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .card-header-title h3 {
          margin: 0;
          color: #1e293b;
        }
        
        .orders-count {
          color: #64748b;
          font-size: 0.85rem;
          background: #f1f5f9;
          padding: 4px 12px;
          border-radius: 20px;
        }
        
        .orders-table {
          padding: 0 24px;
        }
        
        .order-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid #f1f5f9;
        }
        
        .order-row:last-child {
          border-bottom: none;
        }
        
        .order-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .order-folio {
          font-weight: bold;
          color: #1e293b;
          font-size: 1rem;
        }
        
        .order-client {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #64748b;
          font-size: 0.85rem;
        }
        
        .order-date {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #94a3b8;
          font-size: 0.75rem;
        }
        
        .order-details {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }
        
        .order-total {
          font-weight: bold;
          color: #059669;
          font-size: 1.2rem;
        }
        
        .empty-orders {
          text-align: center;
          padding: 48px;
          color: #94a3b8;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        
        .estado-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .estado-ingresado { background: #fff3cd; color: #856404; }
        .estado-en_lavado { background: #cce5ff; color: #004085; }
        .estado-en_planchado { background: #d4edda; color: #155724; }
        .estado-listo { background: #d1ecf1; color: #0c5460; }
        .estado-entregado { background: #e2e3e5; color: #383d41; }
        
        .pago-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
        }
        
        .pago-pagado { background: #d4edda; color: #155724; }
        .pago-parcial { background: #fff3cd; color: #856404; }
        .pago-sin_pagar { background: #f8d7da; color: #721c24; }
        
        @media (max-width: 768px) {
          .dashboard {
            padding: 16px;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          
          .stat-card {
            padding: 16px;
          }
          
          .stat-value {
            font-size: 1.3rem;
          }
          
          .stat-icon {
            width: 45px;
            height: 45px;
          }
          
          .stat-icon svg {
            width: 22px;
            height: 22px;
          }
          
          .order-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .order-details {
            align-items: flex-start;
            flex-direction: row;
            flex-wrap: wrap;
          }
          
          .title-with-icon {
            gap: 10px;
          }
          
          .title-with-icon h1 {
            font-size: 1.4rem;
          }
          
          .header-actions {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <div className="skeleton-title"></div>
          <div className="skeleton-subtitle"></div>
        </div>
        <div className="skeleton-button"></div>
      </div>
      <div className="stats-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton-card"></div>
        ))}
      </div>
      <div className="skeleton-chart"></div>
      <div className="skeleton-table"></div>
      <style>{`
        .skeleton-title {
          width: 200px;
          height: 32px;
          background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 8px;
          margin-bottom: 8px;
        }
        .skeleton-subtitle {
          width: 300px;
          height: 20px;
          background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 8px;
        }
        .skeleton-button {
          width: 120px;
          height: 40px;
          background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 12px;
        }
        .skeleton-card {
          height: 95px;
          background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 16px;
        }
        .skeleton-chart {
          height: 250px;
          background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 20px;
          margin-bottom: 32px;
        }
        .skeleton-table {
          height: 300px;
          background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 20px;
        }
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;