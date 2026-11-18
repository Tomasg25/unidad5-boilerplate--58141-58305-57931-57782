import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import DataTable from '../../shared/components/DataTable';
import StatusBadge from '../../shared/components/StatusBadge';
import PageHeader from '../../shared/components/PageHeader';
import { getDoctors } from '../../doctors/services/doctorsService';
import { getSpecialties } from '../../specialties/services/specialtiesService';
import { searchAppointments } from '../../appointments/services/appointmentsService';
function OverviewPage() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [doctorPage, setDoctorPage] = useState(1);
  const [activeDoctorsCount, setActiveDoctorsCount] = useState(0);
  const [activeSpecialtiesCount, setActiveSpecialtiesCount] = useState(0);
  const [todayAppointmentsCount, setTodayAppointmentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const PAGE_SIZE = 5;
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const [docRes, specRes, apptRes] = await Promise.all([
          getDoctors(100, 1),
          getSpecialties(100, 1),
          searchAppointments({ date: today }, 1, 1),
        ]);
        const allDoctors = docRes.data || [];
        const allSpecialties = specRes.data || [];
        setDoctors(allDoctors);
        setTotalDoctors(allDoctors.length);
        setActiveDoctorsCount(allDoctors.filter((d) => d.isActive).length);
        setActiveSpecialtiesCount(allSpecialties.filter((s) => s.isActive).length);
        setTodayAppointmentsCount(apptRes.total || 0);
      } catch {
        setError('Error al cargar el dashboard.');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);
  const totalDoctorPages = Math.ceil(totalDoctors / PAGE_SIZE);
  const pagedDoctors = doctors.slice(
    (doctorPage - 1) * PAGE_SIZE,
    doctorPage * PAGE_SIZE
  );
  const columns = [
    {
      header: 'Nombre del Doctor',
      render: (doc) => (
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-med-primary-100 flex items-center justify-center text-lg">
            <svg className="w-5 h-5 text-med-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
          <span className="font-semibold text-med-primary-900">{doc.name}</span>
        </div>
      ),
    },
    {
      header: 'Especialidad',
      render: (doc) => (
        <span className="text-med-text-sub">{doc.speciality?.name || '—'}</span>
      ),
    },
    {
      header: 'Estado',
      align: 'center',
      render: (doc) => (
        <StatusBadge
          label={doc.isActive ? 'Activo' : 'Inactivo'}
          variant={doc.isActive ? 'active' : 'inactive'}
        />
      ),
    },
    {
      header: 'Acciones',
      align: 'right',
      render: () => (
        <button
          onClick={() => navigate('/admin/doctors')}
          className="text-xs font-semibold text-med-primary-700 hover:text-med-primary-900"
        >
          Ver Detalle
        </button>
      ),
    },
  ];
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-med-primary-900" />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Vista General de Gestión"
        subtitle="Configure el personal médico y las especialidades del departamento."
      >
        <Button onClick={() => navigate('/admin/doctors')} className="flex items-center gap-2">
          <span>+</span>
          <span>Agregar Nuevo Doctor</span>
        </Button>
        <Button variant="secondary" onClick={() => navigate('/admin/specialties')} className="flex items-center gap-2">
          <span>+</span>
          <span>Agregar Nueva Especialidad</span>
        </Button>
      </PageHeader>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-center">
          {error}
        </div>
      )}
      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="flex flex-col justify-between p-6">
          <div className="w-11 h-11 rounded-xl bg-med-primary-50 text-med-primary-900 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="mt-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-med-text-sub">Doctores Activos</span>
            <p className="text-3xl sm:text-4xl font-extrabold text-med-primary-900 mt-1">{activeDoctorsCount}</p>
          </div>
        </Card>
        <Card className="flex flex-col justify-between p-6">
          <div className="w-11 h-11 rounded-xl bg-med-primary-50 text-med-primary-900 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <div className="mt-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-med-text-sub">Especialidades Activas</span>
            <p className="text-3xl sm:text-4xl font-extrabold text-med-primary-900 mt-1">{activeSpecialtiesCount}</p>
          </div>
        </Card>
        <Card className="flex flex-col justify-between p-6">
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-med-primary-50 text-med-primary-900 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-med-primary-100 text-med-primary-700">Hoy</span>
          </div>
          <div className="mt-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-med-text-sub">Turnos Para Hoy</span>
            <p className="text-3xl sm:text-4xl font-extrabold text-med-primary-900 mt-1">{todayAppointmentsCount}</p>
          </div>
        </Card>
      </div>
      <DataTable
        title="Directorio de Profesionales Médicos"
        columns={columns}
        data={pagedDoctors}
        emptyText="No hay doctores registrados."
        rowKey={(doc) => doc.id}
        currentPage={doctorPage}
        totalPages={totalDoctorPages}
        totalItems={totalDoctors}
        pageSize={PAGE_SIZE}
        onPageChange={(page) => setDoctorPage(page)}
      />
    </div>
  );
}
export default OverviewPage;