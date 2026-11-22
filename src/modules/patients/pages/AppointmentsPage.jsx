import { useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import PageHeader from '../../shared/components/PageHeader';
import ConfirmModal from '../../shared/components/ConfirmModal';
import usePatientAppointments from '../hook/usePatientAppointments';

function AppointmentsPage() {
  const navigate = useNavigate();
  const {
    appointments,
    loading,
    error,
    cancelTarget,
    setCancelTarget,
    cancelling,
    handleCancel,
    formatDate,
    formatTime,
  } = usePatientAppointments();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-med-primary-900" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Mis Turnos Médicos"
        subtitle="Consulta y gestiona las citas médicas programadas."
      >
        <Button onClick={() => navigate('/')}>+ Solicitar Nuevo Turno</Button>
      </PageHeader>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-center">
          {error}
        </div>
      )}
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
            <Card
              key={appt.id}
              className="flex flex-col justify-between gap-4 p-6"
            >
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
                <h3 className="text-lg font-bold text-med-primary-900">
                  {appt.doctor}
                </h3>
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
                  <p className="text-xs text-med-text-muted mt-1">
                    Motivo: {appt.reason}
                  </p>
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
      <ConfirmModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancelar Turno"
        confirmText="Sí, cancelar turno"
        cancelText="No, mantener"
        loading={cancelling}
        variant="danger"
      >
        ¿Estás seguro de que querés cancelar el turno con{' '}
        <strong className="text-med-text-main">{cancelTarget?.doctor}</strong>{' '}
        del{' '}
        <strong className="text-med-text-main">
          {cancelTarget && formatDate(cancelTarget.date)} a las{' '}
          {cancelTarget && formatTime(cancelTarget.startTime)} hs
        </strong>
        ?
      </ConfirmModal>
    </div>
  );
}
export default AppointmentsPage;
