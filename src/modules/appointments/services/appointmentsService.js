import { instance } from '../../shared/api/axiosInstance';

// Obtiene los slots libres de un doctor.
// Llama a: GET /api/availabilities?doctorId=xxx&date=yyyy-MM-dd
export const getFreeSlots = async (doctorId, date = null) => {
  const params = { doctorId };
  if (date) {
    params.date = date;
  }
  const response = await instance.get('api/availabilities', { params });
  return response.data;
};

// Reserva un turno para el paciente.
// Llama a: POST /api/appointments
// El backend espera: { doctorId, availabilitySlotId, patient: { dni }, reason }
export const bookAppointment = async (doctorId, slotId, dni, reason) => {
  const response = await instance.post('api/appointments', {
    doctorId,
    availabilitySlotId: slotId,
    patient: { dni: Number(dni) },
    reason,
  });
  return response.data;
};

// Obtiene los turnos reservados del paciente.
// Llama a: GET /api/appointments/patient?dni=12345678
export const getPatientAppointments = async (dni) => {
  const response = await instance.get('api/appointments/patient', {
    params: { dni: Number(dni) },
  });
  return response.data;
};
// Cancela un turno del paciente.
// Llama a: DELETE /api/appointments/{id}
export const cancelAppointment = async (id) => {
  const response = await instance.delete(`api/appointments/${id}`);
  return response.data;
};