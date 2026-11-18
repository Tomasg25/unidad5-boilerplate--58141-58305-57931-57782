import { useState, useEffect } from 'react';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import { getSpecialties } from '../../specialties/services/specialtiesService';
import { getDoctors } from '../../doctors/services/doctorsService';
import { searchAppointments } from '../services/appointmentsService';

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const STATUS_MAP = {
  Booked: { label: 'CONFIRMADO', bg: 'bg-med-active-bg', text: 'text-med-active-text', dot: 'bg-med-active-text' },
  Cancelled: { label: 'CANCELADO', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  Attended: { label: 'ATENDIDO', bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500' },
  NoShow: { label: 'NO ASISTIÓ', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
};

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return `${DAY_NAMES[d.getDay()]} ${day} de ${MONTH_NAMES[month - 1]}`;
}

function AppointmentsSearchPage() {
  // Datos para los dropdowns
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Filtros
  const [dniFilter, setDniFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Resultados
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);

  // UI
  const [loading, setLoading] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  // Cargar especialidades y doctores para los dropdowns
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

  // Buscar turnos
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

  // Limpiar filtros
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

  // Chips de filtros activos
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

  return (
    <div className="flex flex-col gap-6">
      {/* Título */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-med-text-main">
          Búsqueda y Filtrado de Citas
        </h1>
        <p className="text-sm text-med-text-sub mt-1">
          Gestione y supervise el flujo de pacientes del departamento.
        </p>
      </div>

      {/* Card Filtros */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-med-border-subtle">
          <h2 className="text-base font-bold text-med-primary-900">Criterios de Búsqueda</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-4 items-end">
          {/* DNI */}
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

          {/* Especialidad */}
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

          {/* Doctor */}
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

          {/* Fecha */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-med-text-sub">Fecha</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-med-border rounded-lg text-med-text-main focus:outline-none focus:ring-1 focus:ring-med-primary-600"
            />
          </div>

          {/* Botón Aplicar */}
          <div>
            <Button
              onClick={() => handleSearch(1)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-med-primary-900 hover:bg-med-primary-800 text-white font-medium py-2 rounded-lg disabled:opacity-50"
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

        {/* Chips de filtros activos */}
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

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-center">
          {error}
        </div>
      )}

      {/* Card Resultados */}
      {searched && (
        <Card className="p-0 overflow-hidden border-med-border">
          <div className="p-5 border-b border-med-border">
            <h2 className="text-base font-bold text-med-primary-900">Registros de Citas</h2>
          </div>

          {results.length === 0 ? (
            <div className="p-10 text-center text-sm text-med-text-muted">
              No se encontraron turnos con los filtros aplicados.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-med-primary-50/70 text-[11px] uppercase tracking-wider text-med-text-sub border-b border-med-border">
                    <tr>
                      <th className="px-6 py-3.5">Fecha</th>
                      <th className="px-6 py-3.5">Especialidad / Doctor</th>
                      <th className="px-6 py-3.5">Paciente</th>
                      <th className="px-6 py-3.5 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-med-border-subtle">
                    {results.map((item) => {
                      const status = STATUS_MAP[item.appointmentsStatus] || STATUS_MAP.Booked;
                      return (
                        <tr key={item.appointmentsId} className="hover:bg-gray-50/70 transition-colors">
                          {/* Fecha y Hora */}
                          <td className="px-6 py-4">
                            <p className="font-bold text-med-primary-900 text-sm">
                              {formatDate(item.date)}
                            </p>
                            <p className="text-xs text-med-text-muted mt-0.5">
                              {item.startTime} - {item.endTime} hs
                            </p>
                          </td>

                          {/* Especialidad / Doctor */}
                          <td className="px-6 py-4">
                            <p className="font-semibold text-med-primary-900">
                              {item.doctor.specialty.name}
                            </p>
                            <p className="text-xs text-med-text-muted">{item.doctor.name}</p>
                          </td>

                          {/* Paciente */}
                          <td className="px-6 py-4">
                            <p className="font-semibold text-med-text-main">
                              {item.patient.fullName || '—'}
                            </p>
                            <p className="text-xs text-med-text-muted mt-0.5">
                              DNI: {item.patient.dni}
                            </p>
                          </td>

                          {/* Estado */}
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Paginador */}
              <div className="p-4 bg-med-primary-50/50 border-t border-med-border flex items-center justify-between text-xs text-med-text-muted">
                <span>
                  Mostrando {results.length} de {total} registros — Página {pageIndex} de{' '}
                  {totalPages || 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={pageIndex <= 1}
                    onClick={() => handleSearch(pageIndex - 1)}
                    className="px-2.5 py-1 border border-med-border rounded bg-white text-med-text-sub hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ‹
                  </button>
                  <button
                    disabled={pageIndex >= totalPages}
                    onClick={() => handleSearch(pageIndex + 1)}
                    className="px-2.5 py-1 border border-med-border rounded bg-white text-med-text-sub hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ›
                  </button>
                </div>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}

export default AppointmentsSearchPage;