import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// CLIENTES
// ============================================

export const getClientes = async () => {
  try {
    const response = await api.get('/clientes');
    return response.data;
  } catch (error) {
    console.error('Error fetching clientes:', error);
    throw error;
  }
};

export const createCliente = async (cliente) => {
  try {
    const response = await api.post('/clientes', cliente);
    return response.data;
  } catch (error) {
    console.error('Error creating cliente:', error);
    throw error;
  }
};

export const buscarClientePorTelefono = async (telefono) => {
  try {
    const response = await api.get(`/clientes/buscar/${telefono}`);
    return response.data;
  } catch (error) {
    console.error('Error searching cliente:', error);
    throw error;
  }
};

// ============================================
// CATEGORÍAS
// ============================================

export const getCategorias = async () => {
  try {
    const response = await api.get('/categorias');
    return response.data;
  } catch (error) {
    console.error('Error fetching categorias:', error);
    throw error;
  }
};

export const createCategoria = async (nombre, descripcion) => {
  try {
    const response = await api.post('/categorias', { nombre, descripcion });
    return response.data;
  } catch (error) {
    console.error('Error creating categoria:', error);
    throw error;
  }
};

export const deleteCategoria = async (id) => {
  try {
    const response = await api.delete(`/categorias/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting categoria:', error);
    throw error;
  }
};

// ============================================
// SERVICIOS
// ============================================

export const getServicios = async () => {
  try {
    const response = await api.get('/servicios');
    return response.data;
  } catch (error) {
    console.error('Error fetching servicios:', error);
    throw error;
  }
};

export const createServicio = async (servicio) => {
  try {
    const response = await api.post('/servicios', servicio);
    return response.data;
  } catch (error) {
    console.error('Error creating servicio:', error);
    throw error;
  }
};

export const updatePrecioServicio = async (id, precio) => {
  try {
    const response = await api.put(`/servicios/${id}/precio`, { precio });
    return response.data;
  } catch (error) {
    console.error('Error updating precio:', error);
    throw error;
  }
};

export const deleteServicio = async (id) => {
  try {
    const response = await api.delete(`/servicios/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting servicio:', error);
    throw error;
  }
};

// ============================================
// ÓRDENES
// ============================================

export const generarFolio = async () => {
  try {
    const response = await api.get('/generar-folio');
    return response.data;
  } catch (error) {
    console.error('Error generating folio:', error);
    throw error;
  }
};

export const getOrdenes = async () => {
  try {
    const response = await api.get('/ordenes');
    return response.data;
  } catch (error) {
    console.error('Error fetching ordenes:', error);
    throw error;
  }
};

export const getOrdenCompleta = async (id) => {
  try {
    const response = await api.get(`/ordenes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching orden completa:', error);
    throw error;
  }
};

export const createOrden = async (orden, items) => {
  try {
    const response = await api.post('/ordenes', { orden, items });
    return response.data;
  } catch (error) {
    console.error('Error creating orden:', error);
    throw error;
  }
};

export const actualizarEstado = async (id, estado) => {
  try {
    const response = await api.put(`/ordenes/${id}/estado`, { estado });
    return response.data;
  } catch (error) {
    console.error('Error updating estado:', error);
    throw error;
  }
};

export const registrarPago = async (id, monto, metodo_pago, referencia) => {
  try {
    const response = await api.post(`/ordenes/${id}/pagos`, { 
      monto, 
      metodo_pago, 
      referencia 
    });
    return response.data;
  } catch (error) {
    console.error('Error registrando pago:', error);
    throw error;
  }
};

// ============================================
// CONFIGURACIÓN
// ============================================

export const getConfiguracion = async (clave) => {
  try {
    const response = await api.get(`/config/${clave}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching config:', error);
    throw error;
  }
};

export const setConfiguracion = async (clave, valor) => {
  try {
    const response = await api.put(`/config/${clave}`, { valor });
    return response.data;
  } catch (error) {
    console.error('Error setting config:', error);
    throw error;
  }
};

export default api;