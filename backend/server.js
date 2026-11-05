const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3001;  // Cambiamos a 3001 para no conflictos con React

// Middleware
app.use(cors());
app.use(express.json());

// Importar funciones de base de datos (ruta corregida)
const db = require('./database/database.js');

// Inicializar base de datos
db.initDatabase();

// ============================================
// API: CLIENTES
// ============================================

app.get('/api/clientes', (req, res) => {
    db.getClientes((err, clientes) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(clientes);
    });
});

app.post('/api/clientes', (req, res) => {
    db.createCliente(req.body, (err) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ success: true });
    });
});

app.get('/api/clientes/buscar/:telefono', (req, res) => {
    db.buscarClientePorTelefono(req.params.telefono, (err, clientes) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(clientes);
    });
});

// ============================================
// API: CATEGORÍAS Y SERVICIOS
// ============================================

app.get('/api/categorias', (req, res) => {
    db.getCategorias((err, categorias) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(categorias);
    });
});

app.post('/api/categorias', (req, res) => {
    const { nombre, descripcion } = req.body;
    db.createCategoria(nombre, descripcion, (err) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ success: true });
    });
});

app.delete('/api/categorias/:id', (req, res) => {
    db.deleteCategoria(req.params.id, (err) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ success: true });
    });
});

app.get('/api/servicios', (req, res) => {
    db.getAllServicios((err, servicios) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(servicios);
    });
});

app.post('/api/servicios', (req, res) => {
    db.createServicio(req.body, (err) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ success: true });
    });
});

app.put('/api/servicios/:id/precio', (req, res) => {
    const { precio } = req.body;
    db.updateServicioPrecio(req.params.id, precio, (err) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ success: true });
    });
});

// ============================================
// API: ÓRDENES
// ============================================

app.get('/api/generar-folio', (req, res) => {
    db.generarFolio((err, folio) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ folio });
    });
});

app.post('/api/ordenes', (req, res) => {
    const { orden, items } = req.body;
    db.createOrden(orden, items, (err, ordenId) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ success: true, ordenId });
    });
});

app.get('/api/ordenes', (req, res) => {
    db.getOrdenes((err, ordenes) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(ordenes);
    });
});

app.get('/api/ordenes/:id', (req, res) => {
    db.getOrdenCompleta(req.params.id, (err, orden) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(orden);
    });
});

app.put('/api/ordenes/:id/estado', (req, res) => {
    const { estado } = req.body;
    db.actualizarEstadoRopa(req.params.id, estado, (err) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ success: true });
    });
});

app.post('/api/ordenes/:id/pagos', (req, res) => {
    const { monto, metodo_pago, referencia } = req.body;
    db.registrarPago(req.params.id, monto, metodo_pago, referencia, (err) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ success: true });
    });
});

// ============================================
// API: CONFIGURACIÓN
// ============================================

app.get('/api/config/:clave', (req, res) => {
    db.getConfiguracion(req.params.clave, (err, row) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ valor: row?.valor });
    });
});

app.put('/api/config/:clave', (req, res) => {
    const { valor } = req.body;
    db.setConfiguracion(req.params.clave, valor, (err) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ success: true });
    });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   LA PERCHA BLANCA                     ║
╠════════════════════════════════════════╣
║   Puerto: ${PORT}                      ║
║   API: http://localhost:${PORT}/api    ║
╚════════════════════════════════════════╝
    `);
});