import { instance } from '../../shared/api/axiosInstance';
 
// Trae la lista de doctores paginada.
// El backend devuelve: { pageSize, pageIndex, total, data: [...] }
// Cada doctor tiene: { id, name, licenseNumber, speciality: { specialityId, name } }
export const getDoctors = async (pageSize = 10, pageIndex = 1, name = '') => {
  const params = { pageSize, pageIndex };
  if (name && name.length >= 3) {
    params.name = name;
  }
  const response = await instance.get('api/doctors', { params });
  return response.data;
};
 
// Crea un doctor nuevo.
// El backend espera: { name, licenseNumber, specialityId }
export const createDoctor = async (name, licenseNumber, specialityId) => {
  const response = await instance.post('api/doctors', {
    name,
    licenseNumber,
    specialityId,
  });
  return response.data;
};
 
// Actualiza un doctor existente.
// Mismo body que crear, pero con PUT y el id en la URL.
export const updateDoctor = async (id, name, licenseNumber, specialityId) => {
  const response = await instance.put(`api/doctors/${id}`, {
    name,
    licenseNumber,
    specialityId,
  });
  return response.data;
};
 
// Elimina un doctor (soft delete en el backend).
export const deleteDoctor = async (id) => {
  const response = await instance.delete(`api/doctors/${id}`);
  return response.data;
};

// Activa o desactiva un doctor (toggle).
// Si estaba activo lo pone inactivo, y viceversa.
export const toggleDoctorStatus = async (id) => {
  const response = await instance.patch(`api/doctors/${id}/toggle-status`);
  return response.data;
};

