-- ============================================
-- LA PERCHA BLANCA - SISTEMA DE LAVANDERÍA
-- ============================================

-- 1. CATEGORÍAS (dinámicas, las puedes crear desde interfaz)
CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    activo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. SERVICIOS (dinámicos, los puedes crear desde interfaz)
CREATE TABLE IF NOT EXISTS servicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    precio_base REAL NOT NULL DEFAULT 0,
    tiempo_estimado INTEGER DEFAULT 60,
    activo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT
);

-- 3. CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    telefono TEXT,
    direccion TEXT,
    email TEXT,
    permitir_entrega_con_deuda INTEGER DEFAULT 0,
    notas TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. ÓRDENES (principal)
CREATE TABLE IF NOT EXISTS ordenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    folio TEXT UNIQUE NOT NULL,
    cliente_id INTEGER NOT NULL,
    fecha_ingreso DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_prometida DATETIME NOT NULL,
    fecha_entrega DATETIME,
    estado_ropa TEXT DEFAULT 'ingresado',
    subtotal REAL NOT NULL DEFAULT 0,
    descuento REAL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    total_pagado REAL DEFAULT 0,
    estado_pago TEXT DEFAULT 'sin_pagar',
    notas TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- 5. ITEMS DE ORDEN (prendas o servicios)
CREATE TABLE IF NOT EXISTS orden_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orden_id INTEGER NOT NULL,
    servicio_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario REAL NOT NULL,
    subtotal REAL NOT NULL,
    detalle TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orden_id) REFERENCES ordenes(id) ON DELETE CASCADE,
    FOREIGN KEY (servicio_id) REFERENCES servicios(id)
);

-- 6. PAGOS (historial completo)
CREATE TABLE IF NOT EXISTS pagos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orden_id INTEGER NOT NULL,
    monto REAL NOT NULL,
    metodo_pago TEXT NOT NULL,
    referencia TEXT,
    fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
    notas TEXT,
    FOREIGN KEY (orden_id) REFERENCES ordenes(id) ON DELETE CASCADE
);

-- 7. CONFIGURACIÓN
CREATE TABLE IF NOT EXISTS configuracion (
    clave TEXT PRIMARY KEY,
    valor TEXT,
    descripcion TEXT
);

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Categorías base
INSERT OR IGNORE INTO categorias (nombre, descripcion) VALUES 
('Lavado', 'Servicios de lavado de ropa'),
('Planchado', 'Servicios de planchado'),
('Tintorería', 'Limpieza en seco y prendas delicadas'),
('Secado', 'Servicio exclusivo de secado');

-- Servicios base
INSERT OR IGNORE INTO servicios (categoria_id, nombre, precio_base, tiempo_estimado) VALUES 
(1, 'Lavado normal', 50.00, 60),
(1, 'Lavado express', 80.00, 30),
(1, 'Lavado delicado', 70.00, 45),
(2, 'Planchado camisa', 15.00, 10),
(2, 'Planchado pantalón', 18.00, 10),
(2, 'Planchado vestido', 25.00, 15),
(3, 'Traje completo', 120.00, 120),
(3, 'Vestido de novia', 250.00, 180),
(4, 'Secado por kilo', 30.00, 30);

-- Configuración inicial
INSERT OR IGNORE INTO configuracion (clave, valor, descripcion) VALUES 
('negocio_nombre', 'La Percha Blanca', 'Nombre del negocio en tickets'),
('dias_alerta_retraso', '3', 'Días para alertar ropa sin recoger'),
('impuestos_porcentaje', '0', 'IVA o impuesto'),
('entregar_con_deuda_default', '0', 'Valor por defecto para nuevos clientes');

-- Cliente de ejemplo
INSERT OR IGNORE INTO clientes (nombre, telefono, direccion) VALUES 
('Cliente de prueba', '555-1234', 'Calle Principal 123');

-- Órdenes de ejemplo (folio LA-001)
INSERT OR IGNORE INTO ordenes (folio, cliente_id, fecha_prometida, subtotal, total, estado_ropa) 
VALUES ('LA-001', 1, datetime('now', '+2 days'), 65.00, 65.00, 'listo');

INSERT OR IGNORE INTO orden_items (orden_id, servicio_id, cantidad, precio_unitario, subtotal) 
VALUES (1, 1, 1, 50.00, 50.00),
       (1, 4, 1, 15.00, 15.00);

-- Pago de ejemplo
INSERT OR IGNORE INTO pagos (orden_id, monto, metodo_pago) 
VALUES (1, 65.00, 'efectivo');