import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '', tooltip: 'Resumen general' },
  { id: 'ordenes', label: 'Órdenes', icon: '', tooltip: 'Gestionar órdenes' },
  { id: 'nueva-orden', label: 'Nueva Orden', icon: '', tooltip: 'Crear orden' },
  { id: 'clientes', label: 'Clientes', icon: '', tooltip: 'Base de clientes' },
  { id: 'servicios', label: 'Servicios', icon: '', tooltip: 'Catálogo servicios' },
  { id: 'pagos', label: 'Pagos', icon: '', tooltip: 'Control de pagos' },
];

function Layout({ children, currentView, onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  
  const fechaActual = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  const currentMenuItem = menuItems.find(m => m.id === currentView);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [currentView]);

  const NavButton = ({ item }) => (
    <motion.button
      className={`nav-btn ${currentView === item.id ? 'active' : ''}`}
      onClick={() => onNavigate(item.id)}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setHoveredItem(item.id)}
      onHoverEnd={() => setHoveredItem(null)}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <motion.span 
        className="nav-icon"
        animate={currentView === item.id ? { scale: 1.2 } : {}}
      >
        {item.icon}
      </motion.span>
      <AnimatePresence>
        {(currentView === item.id || hoveredItem === item.id) && (
          <motion.span
            className="nav-tooltip"
            initial={{ opacity: 0, scale: 0.8, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            {item.tooltip}
          </motion.span>
        )}
      </AnimatePresence>
      <span className="nav-label">{item.label}</span>
      {currentView === item.id && (
        <motion.div
          className="active-indicator"
          layoutId="activeIndicator"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </motion.button>
  );

  return (
    <div className="app">
      {/* Mobile Top Bar */}
      <motion.div 
        className="mobile-topbar"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <button 
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <h1 className="mobile-title">{currentMenuItem?.label || 'Dashboard'}</h1>
        <div className="mobile-date">{fechaActual}</div>
      </motion.div>

      {/* Sidebar */}
      <motion.aside 
        className="sidebar"
        animate={{ 
          x: sidebarOpen ? 0 : '-100%',
          opacity: sidebarOpen ? 1 : 1
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.div 
          className="logo"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="logo-icon">🧺</div>
          <div className="logo-text">
            <h2>La Percha Blanca</h2>
            <p>Lavandería Profesional</p>
          </div>
        </motion.div>

        <nav className="nav-menu" role="navigation" aria-label="Menú principal">
          {menuItems.map((item, index) => (
            <NavButton key={item.id} item={item} style={{ 
              '--delay': `${index * 0.05}s` 
            }} />
          ))}
        </nav>

        <motion.div 
          className="sidebar-footer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="footer-info">
            <div className="status-indicator"></div>
            <span>En línea</span>
          </div>
        </motion.div>
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <div className="top-bar-left">
            <motion.h1
              key={currentView}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {currentMenuItem?.label || 'Dashboard'}
            </motion.h1>
            <div className="breadcrumb">
              <span>Dashboard</span>
              <span className="divider">/</span>
              <span>{currentMenuItem?.label}</span>
            </div>
          </div>
          
          <div className="top-bar-right">
            <div className="notifications">
              <button className="notif-btn" aria-label="Notificaciones">
                🔔
                <span className="notif-badge">3</span>
              </button>
            </div>
            <div className="user-info">
              <span className="date">{fechaActual}</span>
              <div className="user-avatar">👤</div>
            </div>
          </div>
        </header>

        <div className="view-container">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      <style jsx>{`
        :global(body) {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .app {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          overflow: hidden;
        }

        /* Mobile Topbar */
        .mobile-topbar {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(20px);
          z-index: 1001;
          padding: 16px 24px;
          box-shadow: 0 2px 20px rgba(0,0,0,0.1);
        }

        .mobile-menu-btn {
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .mobile-menu-btn span {
          width: 24px;
          height: 3px;
          background: #333;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .mobile-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2c3e50;
          margin: 0;
          flex: 1;
          text-align: center;
        }

        .mobile-date {
          font-size: 0.9rem;
          color: #666;
        }

        /* Sidebar */
        .sidebar {
          width: 280px;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(255,255,255,0.2);
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          z-index: 1000;
          box-shadow: 2px 0 20px rgba(0,0,0,0.1);
        }

        .logo {
          padding: 32px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        .logo-icon {
          font-size: 2.5rem;
        }

        .logo-text h2 {
          margin: 0 0 4px 0;
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logo-text p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .nav-menu {
          flex: 1;
          padding: 24px 0;
          overflow-y: auto;
        }

        .nav-btn {
          width: 100%;
          padding: 16px 24px;
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          position: relative;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .nav-btn:hover {
          background: rgba(102, 126, 234, 0.1);
        }

        .nav-btn.active {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
          color: #667eea;
        }

        .nav-icon {
          font-size: 1.5rem;
          min-width: 24px;
          transition: all 0.3s ease;
        }

        .nav-label {
          font-weight: 500;
          font-size: 1rem;
          flex: 1;
        }

        .nav-tooltip {
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          background: #2c3e50;
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          white-space: nowrap;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          margin-left: 12px;
        }

        .active-indicator {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 32px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 2px 0 0 2px;
        }

        .sidebar-footer {
          padding: 24px;
          border-top: 1px solid rgba(0,0,0,0.05);
        }

        .footer-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .status-indicator {
          width: 12px;
          height: 12px;
          background: #27ae60;
          border-radius: 50%;
          box-shadow: 0 0 0 2px white;
          animation: pulse 2s infinite;
        }

        /* Main Content */
        .main-content {
          flex: 1;
          margin-left: 280px;
          min-height: 100vh;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
        }

        .top-bar {
          background: white;
          padding: 24px 32px;
          box-shadow: 0 2px 20px rgba(0,0,0,0.08);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
        }

        .top-bar-left h1 {
          margin: 0 0 8px 0;
          font-size: 2rem;
          font-weight: 800;
          color: #1a202c;
          line-height: 1.2;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 0.95rem;
        }

        .breadcrumb .divider {
          color: #cbd5e1;
        }

        .top-bar-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .notif-btn {
          position: relative;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 8px;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .notif-btn:hover {
          background: #f1f5f9;
          transform: scale(1.1);
        }

        .notif-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .date {
          color: #64748b;
          font-size: 0.95rem;
          white-space: nowrap;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .user-avatar:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .view-container {
          flex: 1;
          padding: 32px;
          overflow-y: auto;
        }

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 999;
          backdrop-filter: blur(4px);
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .main-content {
            margin-left: 0;
          }
          .mobile-topbar {
            display: flex;
            align-items: center;
            gap: 16px;
            z-index: 1002;
          }
        }

        @media (max-width: 768px) {
          .top-bar {
            padding: 20px 24px;
            flex-direction: column;
            align-items: stretch;
            gap: 20px;
          }
          
          .top-bar-left, .top-bar-right {
            order: 2;
          }
          
          .top-bar-right {
            justify-content: flex-end;
          }

          .view-container {
            padding: 24px 16px;
          }
        }
      `}</style>
    </div>
  );
}

export default Layout;