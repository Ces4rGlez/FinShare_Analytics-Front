import api from './api';

// Encapsulamos todas las llamadas a la API oficial (en inglés y protegida)
const grupoService = {
  
  // 1. Obtener mis grupos (El backend sabe de quién son por el Token)
  obtenerTodos: async () => {
    const response = await api.get('/groups/');
    // Extraemos la propiedad 'data' que genera el success_response de Flask
    // Usamos el operador || por si acaso la estructura varía un poco
    return response.data.data || response.data;
  },

  obtenerPorId: async (id) => {
    const response = await api.get(`/groups/${id}`);
    return response.data.data || response.data;
  },

  // 2. Crear un grupo (URL limpia siguiendo el estándar REST)
  crear: async (datosGrupo) => {
    const response = await api.post('/groups/', datosGrupo);
    return response.data.data || response.data;
  },

  // 3. Actualizar un grupo
  actualizar: async (id, datosNuevos) => {
    // Apuntamos a la nueva ruta en inglés
    const response = await api.patch(`/groups/${id}`, datosNuevos);
    return response.data.data || response.data;
  },

  // 4. Eliminar un grupo
  eliminar: async (id) => {
    const response = await api.delete(`/groups/${id}`);
    return response.data.data || response.data;
  },

  invitarMiembro: async (groupId, email) => {
    const response = await api.post(`/groups/${groupId}/members`, { email });
    return response.data.data || response.data;
  },

  removerMiembro: async (groupId, userId) => {
    const response = await api.delete(`/groups/${groupId}/members/${userId}`);
    return response.data.data || response.data;
  },

  obtenerDesglose: async (groupId) => {
    const response = await api.get(`/groups/${groupId}/breakdown`);
    return response.data.data || response.data;
  },
};



export default grupoService;