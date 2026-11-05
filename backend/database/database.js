const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ruta donde se guardará la base de datos
const dbPath = path.join(__dirname, 'la_percha_blanca.db');

// Crear/Cargar base de datos
const db = new sqlite3.Database(dbPath);

// Función para inicializar las tablas
function initDatabase() {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    // Ejecutar el schema completo
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error al crear tablas:', err.message);
        } else {
            console.log('Base de datos inicializada correctamente');
            console.log('Ubicación:', dbPath);
        }
    });
}

// ============================================
// FUNCIONES PARA CLIENTES
// ============================================

// Obtener todos los clientes
function getClientes(callback) {
    db.all('SELECT * FROM clientes ORDER BY nombre', [], callback);
}

// Crear nuevo cliente
function createCliente(cliente, callback) {
    const { nombre, telefono, direccion, email, permitir_entrega_con_deuda, notas } = cliente;
    db.run(
        `INSERT INTO clientes (nombre, telefono, direccion, email, permitir_entrega_con_deuda, notas) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [nombre, telefono || '', direccion || '', email || '', permitir_entrega_con_deuda || 0, notas || ''],
        callback
    );
}

// Buscar cliente por ID
function getClienteById(id, callback) {
    db.get('SELECT * FROM clientes WHERE id = ?', [id], callback);
}

// Buscar cliente por teléfono
function buscarClientePorTelefono(telefono, callback) {
    db.all('SELECT * FROM clientes WHERE telefono LIKE ? ORDER BY nombre', [`%${telefono}%`], callback);
}

// ============================================
// FUNCIONES PARA CATEGORÍAS Y SERVICIOS
// ============================================

// Obtener todas las categorías
function getCategorias(callback) {
    db.all('SELECT * FROM categorias WHERE activo = 1 ORDER BY nombre', [], callback);
}

// Crear nueva categoría
function createCategoria(nombre, descripcion, callback) {
    db.run('INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion || ''], callback);
}

// Eliminar categoría (solo si no tiene servicios)
function deleteCategoria(id, callback) {
    db.run('DELETE FROM categorias WHERE id = ?', [id], callback);
}

// Obtener servicios por categoría
function getServiciosByCategoria(categoria_id, callback) {
    db.all('SELECT * FROM servicios WHERE categoria_id = ? AND activo = 1 ORDER BY nombre', [categoria_id], callback);
}

// Obtener todos los servicios activos
function getAllServicios(callback) {
    db.all(`
        SELECT s.*, c.nombre as categoria_nombre 
        FROM servicios s
        JOIN categorias c ON s.categoria_id = c.id
        WHERE s.activo = 1
        ORDER BY c.nombre, s.nombre
    `, [], callback);
}

// Crear nuevo servicio
function createServicio(servicio, callback) {
    const { categoria_id, nombre, precio_base, tiempo_estimado } = servicio;
    db.run(
        `INSERT INTO servicios (categoria_id, nombre, precio_base, tiempo_estimado) 
         VALUES (?, ?, ?, ?)`,
        [categoria_id, nombre, precio_base, tiempo_estimado || 60],
        callback
    );
}

// ============================================
// FUNCIONES PARA ÓRDENES
// ============================================

// Generar nuevo folio
function generarFolio(callback) {
    db.get('SELECT COUNT(*) as total FROM ordenes', [], (err, row) => {
        if (err) callback(err);
        const numero = (row.total + 1).toString().padStart(4, '0');
        callback(null, `LA-${numero}`);
    });
}

// Crear nueva orden
function createOrden(orden, items, callback) {
    const {
        folio, cliente_id, fecha_prometida, subtotal, descuento, total, notas
    } = orden;

    db.run(
        `INSERT INTO ordenes (folio, cliente_id, fecha_prometida, subtotal, descuento, total, notas) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [folio, cliente_id, fecha_prometida, subtotal, descuento || 0, total, notas || ''],
        function(err) {
            if (err) {
                callback(err);
                return;
            }
            const orden_id = this.lastID;
            
            // Insertar items
            let itemsInsertados = 0;
            items.forEach(item => {
                db.run(
                    `INSERT INTO orden_items (orden_id, servicio_id, cantidad, precio_unitario, subtotal, detalle) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [orden_id, item.servicio_id, item.cantidad, item.precio_unitario, item.subtotal, item.detalle || ''],
                    (err) => {
                        if (err) console.error('Error al insertar item:', err);
                        itemsInsertados++;
                        if (itemsInsertados === items.length) {
                            callback(null, orden_id);
                        }
                    }
                );
            });
        }
    );
}

// Obtener todas las órdenes
function getOrdenes(callback) {
    db.all(`
        SELECT o.*, c.nombre as cliente_nombre, c.telefono as cliente_telefono
        FROM ordenes o
        JOIN clientes c ON o.cliente_id = c.id
        ORDER BY o.id DESC
    `, [], callback);
}

// Obtener orden completa (con items y pagos)
function getOrdenCompleta(orden_id, callback) {
    const ordenCompleta = {};
    
    db.get('SELECT * FROM ordenes WHERE id = ?', [orden_id], (err, orden) => {
        if (err || !orden) {
            callback(err || new Error('Orden no encontrada'));
            return;
        }
        ordenCompleta.orden = orden;
        
        // Obtener items
        db.all(`
            SELECT oi.*, s.nombre as servicio_nombre, s.categoria_id, c.nombre as categoria_nombre
            FROM orden_items oi
            JOIN servicios s ON oi.servicio_id = s.id
            JOIN categorias c ON s.categoria_id = c.id
            WHERE oi.orden_id = ?
        `, [orden_id], (err, items) => {
            ordenCompleta.items = items || [];
            
            // Obtener pagos
            db.all('SELECT * FROM pagos WHERE orden_id = ? ORDER BY fecha_pago', [orden_id], (err, pagos) => {
                ordenCompleta.pagos = pagos || [];
                callback(null, ordenCompleta);
            });
        });
    });
}

// Actualizar estado de ropa
function actualizarEstadoRopa(orden_id, nuevo_estado, callback) {
    db.run('UPDATE ordenes SET estado_ropa = ? WHERE id = ?', [nuevo_estado, orden_id], callback);
}

// Registrar pago
function registrarPago(orden_id, monto, metodo_pago, referencia, callback) {
    // Insertar el pago
    db.run(
        `INSERT INTO pagos (orden_id, monto, metodo_pago, referencia) 
         VALUES (?, ?, ?, ?)`,
        [orden_id, monto, metodo_pago, referencia || ''],
        (err) => {
            if (err) {
                callback(err);
                return;
            }
            
            // Actualizar total_pagado en la orden
            db.get('SELECT SUM(monto) as total_pagado FROM pagos WHERE orden_id = ?', [orden_id], (err, row) => {
                const total_pagado = row?.total_pagado || 0;
                
                db.get('SELECT total FROM ordenes WHERE id = ?', [orden_id], (err, ordenRow) => {
                    let estado_pago = 'sin_pagar';
                    if (total_pagado >= ordenRow.total) {
                        estado_pago = 'pagado';
                    } else if (total_pagado > 0) {
                        estado_pago = 'parcial';
                    }
                    
                    db.run(
                        'UPDATE ordenes SET total_pagado = ?, estado_pago = ? WHERE id = ?',
                        [total_pagado, estado_pago, orden_id],
                        callback
                    );
                });
            });
        }
    );
}

// ============================================
// FUNCIONES PARA CONFIGURACIÓN
// ============================================

function getConfiguracion(clave, callback) {
    db.get('SELECT valor FROM configuracion WHERE clave = ?', [clave], callback);
}

function setConfiguracion(clave, valor, callback) {
    db.run('UPDATE configuracion SET valor = ? WHERE clave = ?', [valor, clave], callback);
}

// ============================================
// EXPORTAR FUNCIONES
// ============================================

module.exports = {
    initDatabase,
    db,
    // Clientes
    getClientes,
    createCliente,
    getClienteById,
    buscarClientePorTelefono,
    // Categorías y servicios
    getCategorias,
    createCategoria,
    deleteCategoria,
    getServiciosByCategoria,
    getAllServicios,
    createServicio,
    // Órdenes
    generarFolio,
    createOrden,
    getOrdenes,
    getOrdenCompleta,
    actualizarEstadoRopa,
    registrarPago,
    // Configuración
    getConfiguracion,
    setConfiguracion
};