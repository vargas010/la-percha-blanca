import React, { useState } from 'react';
import './App.css';

import Dashboard from './components/Dashboard';
import Ordenes from './components/Ordenes';
import NuevaOrden from './components/NuevaOrden';
import Clientes from './components/Clientes';
import Servicios from './components/Servicios';
import Pagos from './components/Pagos';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const views = {
    dashboard: <Dashboard />,
    ordenes: <Ordenes />,
    'nueva-orden': <NuevaOrden />,
    clientes: <Clientes />,
    servicios: <Servicios />,
    pagos: <Pagos />
  };

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo">
          <h2>La Percha Blanca</h2>
          <span className="logo-subtitle">Sistema</span>
        </div>

        <nav className="nav-menu">
          <button className={`nav-btn ${currentView==='dashboard'?'active':''}`} onClick={()=>setCurrentView('dashboard')}>
            Dashboard
          </button>

          <button className={`nav-btn ${currentView==='ordenes'?'active':''}`} onClick={()=>setCurrentView('ordenes')}>
            Órdenes
          </button>

          <button className={`nav-btn ${currentView==='nueva-orden'?'active':''}`} onClick={()=>setCurrentView('nueva-orden')}>
            Nueva Orden
          </button>

          <button className={`nav-btn ${currentView==='clientes'?'active':''}`} onClick={()=>setCurrentView('clientes')}>
            Clientes
          </button>

          <button className={`nav-btn ${currentView==='servicios'?'active':''}`} onClick={()=>setCurrentView('servicios')}>
            Servicios
          </button>

          <button className={`nav-btn ${currentView==='pagos'?'active':''}`} onClick={()=>setCurrentView('pagos')}>
            Pagos
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <div className="main-content">

        <div className="top-bar">
          <h1>{currentView.replace('-', ' ').toUpperCase()}</h1>
        </div>

        <div className="view-container">
          {views[currentView]}
        </div>

      </div>

    </div>
  );
}

export default App;