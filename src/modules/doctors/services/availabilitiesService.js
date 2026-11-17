import { instance } from '../../shared/api/axiosInstance';
// Trae la disponibilidad actual del doctor para el mes en curso.
// Devuelve un array de objetos: { availabilityId, day, startTime, endTime }
// Ejemplo: [{ day: "LUNES", startTime: "08:00", endTime: "12:00" }]
export const getAvailabilities = async (doctorId) => {
  const response = await instance.get(
    `api/doctors/${doctorId}/availabilities`
  );
  return response.data;
};
// Crea disponibilidad nueva para un doctor.
// days es un array de: { day: "LUNES", startTime: "08:00", endTime: "12:00" }
export const createAvailability = async (doctorId, days) => {
  const response = await instance.post('api/availabilities', {
    doctorId,
    days,
  });
  return response.data;
};
// Reemplaza la disponibilidad existente del doctor.
// Borra las anteriores (que no tengan turnos reservados) y crea las nuevas.
export const updateAvailability = async (doctorId, days) => {
  const response = await instance.put('api/availabilities', {
    doctorId,
    days,
  });
  return response.data;
};