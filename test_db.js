const dbModule = require('./backend/database/database.js');

// Inicializar base de datos
dbModule.initDatabase();

// Esperar un momento a que se cree
setTimeout(() => {
    console.log('\n=== PROBANDO BASE DE DATOS ===\n');
    
    // Probar: obtener categorías
    dbModule.getCategorias((err, categorias) => {
        if (err) {
            console.error('Error:', err);
        } else {
            console.log('📁 Categorías disponibles:');
            categorias.forEach(cat => {
                console.log(`   - ${cat.nombre}`);
            });
        }
    });
    
    // Probar: obtener servicios
    setTimeout(() => {
        dbModule.getAllServicios((err, servicios) => {
            if (err) {
                console.error('Error:', err);
            } else {
                console.log('\n👕 Servicios disponibles:');
                servicios.forEach(serv => {
                    console.log(`   - ${serv.categoria_nombre}: ${serv.nombre} - $${serv.precio_base}`);
                });
            }
        });
    }, 500);
    
    // Probar: obtener órdenes
    setTimeout(() => {
        dbModule.getOrdenes((err, ordenes) => {
            if (err) {
                console.error('Error:', err);
            } else {
                console.log('\n📋 Órdenes existentes:');
                ordenes.forEach(ord => {
                    console.log(`   - ${ord.folio} | ${ord.cliente_nombre} | Estado: ${ord.estado_ropa} | Total: $${ord.total}`);
                });
            }
            console.log('\n✅ Prueba completada');
        });
    }, 1000);
}, 1000);