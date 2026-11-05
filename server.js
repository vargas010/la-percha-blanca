const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware para procesar JSON
app.use(express.json());
app.use(express.static('frontend'));

// Importar funciones de base de datos
const db = require('./backend/database/database.js');

// Inicializar base de datos al arrancar
db.initDatabase();

// ============================================
// API: CLIENTES
// ============================================

// Obtener todos los clientes
app.get('/api/clientes', (req, res) => {
    db.getClientes((err, clientes) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(clientes);
        }
    });
});

// Crear nuevo cliente
app.post('/api/clientes', (req, res) => {
    db.createCliente(req.body, (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true });
        }
    });
});

// Buscar cliente por teléfono
app.get('/api/clientes/buscar/:telefono', (req, res) => {
    db.buscarClientePorTelefono(req.params.telefono, (err, clientes) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(clientes);
        }
    });
});

// ============================================
// API: CATEGORÍAS Y SERVICIOS
// ============================================

// Obtener categorías
app.get('/api/categorias', (req, res) => {
    db.getCategorias((err, categorias) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(categorias);
        }
    });
});

// Crear categoría
app.post('/api/categorias', (req, res) => {
    const { nombre, descripcion } = req.body;
    db.createCategoria(nombre, descripcion, (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true });
        }
    });
});

// Obtener todos los servicios
app.get('/api/servicios', (req, res) => {
    db.getAllServicios((err, servicios) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(servicios);
        }
    });
});

// Crear servicio
app.post('/api/servicios', (req, res) => {
    db.createServicio(req.body, (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true });
        }
    });
});

// ============================================
// API: ÓRDENES
// ============================================

// Generar nuevo folio
app.get('/api/generar-folio', (req, res) => {
    db.generarFolio((err, folio) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ folio });
        }
    });
});

// Crear orden
app.post('/api/ordenes', (req, res) => {
    const { orden, items } = req.body;
    db.createOrden(orden, items, (err, ordenId) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true, ordenId });
        }
    });
});

// Obtener todas las órdenes
app.get('/api/ordenes', (req, res) => {
    db.getOrdenes((err, ordenes) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(ordenes);
        }
    });
});

// Obtener orden completa
app.get('/api/ordenes/:id', (req, res) => {
    db.getOrdenCompleta(req.params.id, (err, orden) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(orden);
        }
    });
});

// Actualizar estado de ropa
app.put('/api/ordenes/:id/estado', (req, res) => {
    const { estado } = req.body;
    db.actualizarEstadoRopa(req.params.id, estado, (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true });
        }
    });
});

// Registrar pago
app.post('/api/ordenes/:id/pagos', (req, res) => {
    const { monto, metodo_pago, referencia } = req.body;
    db.registrarPago(req.params.id, monto, metodo_pago, referencia, (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true });
        }
    });
});

// ============================================
// API: CONFIGURACIÓN
// ============================================

app.get('/api/config/:clave', (req, res) => {
    db.getConfiguracion(req.params.clave, (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ valor: row?.valor });
        }
    });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   🧺 LA PERCHA BLANCA                  ║
║   Sistema de Lavandería Profesional    ║
╠════════════════════════════════════════╣
║   Servidor: http://localhost:${PORT}    ║
╚════════════════════════════════════════╝
    `);
});