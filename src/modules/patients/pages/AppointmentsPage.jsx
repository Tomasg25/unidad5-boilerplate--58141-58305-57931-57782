import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import {
  getPatientAppointments,
  cancelAppointment,
} from '../../appointments/services/appointmentsService';
const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return `${DAY_NAMES[d.getDay()]} ${day} de ${MONTH_NAMES[month - 1]} de ${year}`;
}
function formatTime(timeStr) {
  return timeStr.substring(0, 5);
}
function AppointmentsPage() {
  const navigate = useNavigate();
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
        err?.response?.data?.message || 'Error al cancelar el turno. Intente nuevamente.';
      setError(msg);
      setCancelTarget(null);
    } finally {
      setCancelling(false);
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-med-primary-900" />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-med-text-main">
            Mis Turnos Médicos
          </h1>
          <p className="text-sm text-med-text-sub mt-1">
            Consulta y gestiona las citas médicas programadas.
          </p>
        </div>
        <Button onClick={() => navigate('/')}>+ Solicitar Nuevo Turno</Button>
      </div>
      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-center">
          {error}
        </div>
      )}
      {/* Lista de turnos o estado vacío */}
      {appointments.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-med-text-muted text-sm">
            No tenés turnos reservados en este momento.
          </p>
          <Button className="mt-4" onClick={() => navigate('/')}>
            Reservar un turno
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {appointments.map((appt) => (
            <Card key={appt.id} className="flex flex-col justify-between gap-4 p-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-med-primary-100 text-med-primary-700">
                    {appt.speciality}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-med-active-bg text-med-active-text">
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    Confirmado
                  </span>
                </div>
                <h3 className="text-lg font-bold text-med-primary-900">{appt.doctor}</h3>
                <p className="text-sm text-med-text-sub mt-2">
                  Fecha:{' '}
                  <strong className="text-med-text-main font-semibold">
                    {formatDate(appt.date)}
                  </strong>{' '}
                  a las{' '}
                  <strong className="text-med-text-main font-semibold">
                    {formatTime(appt.startTime)} hs
                  </strong>
                </p>
                {appt.reason && (
                  <p className="text-xs text-med-text-muted mt-1">Motivo: {appt.reason}</p>
                )}
              </div>
              <div className="flex gap-2 pt-3 border-t border-med-border">
                <Button
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => setCancelTarget(appt)}
                >
                  Cancelar Turno
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {/* Modal de confirmación de cancelación */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              !
            </div>
            <h3 className="text-xl font-bold text-med-primary-900">Cancelar Turno</h3>
            <p className="text-sm text-med-text-sub mt-2 leading-relaxed">
              ¿Estás seguro de que querés cancelar el turno con{' '}
              <strong className="text-med-text-main">{cancelTarget.doctor}</strong> del{' '}
              <strong className="text-med-text-main">
                {formatDate(cancelTarget.date)} a las {formatTime(cancelTarget.startTime)} hs
              </strong>
              ?
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button
                className="w-full text-xs py-2.5 bg-red-600 hover:bg-red-700"
                disabled={cancelling}
                onClick={handleCancel}
              >
                {cancelling ? 'Cancelando...' : 'Sí, cancelar turno'}
              </Button>
              <Button
                variant="secondary"
                className="w-full text-xs py-2.5"
                disabled={cancelling}
                onClick={() => setCancelTarget(null)}
              >
                No, mantener
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AppointmentsPage;