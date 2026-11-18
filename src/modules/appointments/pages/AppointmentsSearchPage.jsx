import { useState, useEffect } from 'react';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import DataTable from '../../shared/components/DataTable';
import StatusBadge from '../../shared/components/StatusBadge';
import PageHeader from '../../shared/components/PageHeader';
import { getSpecialties } from '../../specialties/services/specialtiesService';
import { getDoctors } from '../../doctors/services/doctorsService';
import { searchAppointments } from '../services/appointmentsService';
const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const STATUS_VARIANT = {
  Booked: { label: 'CONFIRMADO', variant: 'booked' },
  Cancelled: { label: 'CANCELADO', variant: 'cancelled' },
  Attended: { label: 'ATENDIDO', variant: 'attended' },
  NoShow: { label: 'NO ASISTIÓ', variant: 'noshow' },
};
function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return `${DAY_NAMES[d.getDay()]} ${day} de ${MONTH_NAMES[month - 1]}`;
}
function AppointmentsSearchPage() {
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [dniFilter, setDniFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [specRes, docRes] = await Promise.all([
          getSpecialties(100, 1),
          getDoctors(100, 1),
        ]);
        setSpecialties(specRes.data || []);
        setDoctors(docRes.data || []);
      } catch {
        setError('Error al cargar filtros.');
      } finally {
        setLoadingFilters(false);
      }
    };
    loadFilters();
  }, []);
  const handleSearch = async (page = 1) => {
    setLoading(true);
    setError('');
    setPageIndex(page);
    try {
      const filters = {};
      if (dniFilter.trim()) filters.dni = dniFilter.trim();
      if (specialtyFilter) filters.specialtyId = specialtyFilter;
      if (doctorFilter) filters.doctorId = doctorFilter;
      if (dateFilter) filters.date = dateFilter;
      const data = await searchAppointments(filters, pageSize, page);
      setResults(data.data || []);
      setTotal(data.total || 0);
      setSearched(true);
    } catch {
      setError('Error al buscar turnos. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  const handleClear = () => {
    setDniFilter('');
    setSpecialtyFilter('');
    setDoctorFilter('');
    setDateFilter('');
    setResults([]);
    setTotal(0);
    setSearched(false);
    setError('');
  };
  const totalPages = Math.ceil(total / pageSize);
  const activeFilters = [];
  if (dniFilter.trim()) activeFilters.push(`DNI: ${dniFilter.trim()}`);
  if (specialtyFilter) {
    const spec = specialties.find((s) => s.id === specialtyFilter);
    if (spec) activeFilters.push(`Especialidad: ${spec.name}`);
  }
  if (doctorFilter) {
    const doc = doctors.find((d) => d.id === doctorFilter);
    if (doc) activeFilters.push(`Doctor: ${doc.name}`);
  }
  if (dateFilter) activeFilters.push(`Fecha: ${dateFilter}`);
  const columns = [
    {
      header: 'Fecha',
      render: (item) => (
        <div>
          <p className="font-bold text-med-primary-900 text-sm">{formatDate(item.date)}</p>
          <p className="text-xs text-med-text-muted mt-0.5">{item.startTime} - {item.endTime} hs</p>
        </div>
      ),
    },
    {
      header: 'Especialidad / Doctor',
      render: (item) => (
        <div>
          <p className="font-semibold text-med-primary-900">{item.doctor.specialty.name}</p>
          <p className="text-xs text-med-text-muted">{item.doctor.name}</p>
        </div>
      ),
    },
    {
      header: 'Paciente',
      render: (item) => (
        <div>
          <p className="font-semibold text-med-text-main">{item.patient.fullName || '—'}</p>
          <p className="text-xs text-med-text-muted mt-0.5">DNI: {item.patient.dni}</p>
        </div>
      ),
    },
    {
      header: 'Estado',
      align: 'center',
      render: (item) => {
        const status = STATUS_VARIANT[item.appointmentsStatus] || STATUS_VARIANT.Booked;
        return <StatusBadge label={status.label} variant={status.variant} />;
      },
    },
  ];
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Búsqueda y Filtrado de Citas"
        subtitle="Gestione y supervise el flujo de pacientes del departamento."
      />
      {/* Card Filtros */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-med-border-subtle">
          <h2 className="text-base font-bold text-med-primary-900">Criterios de Búsqueda</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-med-text-sub">DNI del Paciente</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-med-text-muted">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={dniFilter}
                onChange={(e) => setDniFilter(e.target.value)}
                placeholder="Ej: 40123456"
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-med-border rounded-lg text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-1 focus:ring-med-primary-600"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-med-text-sub">Especialidad</label>
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              disabled={loadingFilters}
              className="w-full px-3 py-2 text-xs bg-white border border-med-border rounded-lg text-med-text-main focus:outline-none focus:ring-1 focus:ring-med-primary-600"
            >
              <option value="">Todas las Especialidades</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-med-text-sub">Doctor</label>
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              disabled={loadingFilters}
              className="w-full px-3 py-2 text-xs bg-white border border-med-border rounded-lg text-med-text-main focus:outline-none focus:ring-1 focus:ring-med-primary-600"
            >
              <option value="">Todos los Doctores</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-med-text-sub">Fecha</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-med-border rounded-lg text-med-text-main focus:outline-none focus:ring-1 focus:ring-med-primary-600"
            />
          </div>
          <div>
            <Button
              onClick={() => handleSearch(1)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              )}
              <span>{loading ? 'Buscando...' : 'Aplicar Filtros'}</span>
            </Button>
          </div>
        </div>
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-med-border-subtle">
            {activeFilters.map((filter) => (
              <span
                key={filter}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sky-100/70 text-sky-800"
              >
                {filter}
              </span>
            ))}
            <button
              onClick={handleClear}
              className="text-xs text-med-text-muted hover:text-red-600 transition ml-2"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </Card>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-center">
          {error}
        </div>
      )}
      {searched && (
        <DataTable
          title="Registros de Citas"
          columns={columns}
          data={results}
          emptyText="No se encontraron turnos con los filtros aplicados."
          rowKey={(item) => item.appointmentsId}
          currentPage={pageIndex}
          totalPages={totalPages}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={(page) => handleSearch(page)}
        />
      )}
    </div>
  );
}
export default AppointmentsSearchPage;