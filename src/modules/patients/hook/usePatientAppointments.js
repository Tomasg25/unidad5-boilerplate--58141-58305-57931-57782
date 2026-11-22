import { useState, useEffect } from 'react';
import {
  getPatientAppointments,
  cancelAppointment,
} from '../../appointments/services/appointmentsService';

const DAY_NAMES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];
const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);

  return `${DAY_NAMES[d.getDay()]} ${day} de ${MONTH_NAMES[month - 1]} de ${year}`;
}

function formatTime(timeStr) {
  return timeStr.substring(0, 5);
}

export default function usePatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const loadAppointments = async () => {
      const dni = localStorage.getItem('patientDni');

      if (!dni) {
        setError('No se encontró su DNI. Por favor, vuelva a iniciar sesión.');
        setLoading(false);

        return;
      }

      try {
        const data = await getPatientAppointments(dni);

        setAppointments(data || []);
      } catch {
        setError('Error al cargar los turnos. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const handleCancel = async () => {
    if (!cancelTarget) return;

    setCancelling(true);
    try {
      await cancelAppointment(cancelTarget.id);
      setAppointments((prev) => prev.filter((a) => a.id !== cancelTarget.id));
      setCancelTarget(null);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Error al cancelar el turno. Intente nuevamente.';

      setError(msg);
      setCancelTarget(null);
    } finally {
      setCancelling(false);
    }
  };

  return {
    appointments,
    loading,
    error,
    cancelTarget,
    setCancelTarget,
    cancelling,
    handleCancel,
    formatDate,
    formatTime,
  };
}
