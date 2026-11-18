import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import { getSpecialties } from '../../specialties/services/specialtiesService';
import { getDoctors } from '../../doctors/services/doctorsService';
import { getFreeSlots, bookAppointment } from '../../appointments/services/appointmentsService';

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const SHORT_DAYS = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const SHORT_MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
const DATES_PER_PAGE = 5;

function parseDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatFullDate(dateStr) {
  const d = parseDate(dateStr);
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} de ${MONTH_NAMES[d.getMonth()]} de ${d.getFullYear()}`;
}

function formatTime(timeStr) {
  return timeStr.substring(0, 5);
}

function PatientHome() {
  const navigate = useNavigate();

  // Datos de la API
  const [specialties, setSpecialties] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [slots, setSlots] = useState([]);

  // Estado de selección
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [datePageIndex, setDatePageIndex] = useState(0);

  // Estado de UI
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [slotsSearched, setSlotsSearched] = useState(false);
  const [confirmedModal, setConfirmedModal] = useState(false);
  const [error, setError] = useState('');
  const [bookedInfo, setBookedInfo] = useState(null);

  // Cargar especialidades y doctores al montar
  useEffect(() => {
    const loadData = async () => {
      try {
        const [specRes, docRes] = await Promise.all([
          getSpecialties(100, 1),
          getDoctors(100, 1),
        ]);
        setSpecialties((specRes.data || []).filter((s) => s.isActive));
        setAllDoctors((docRes.data || []).filter((d) => d.isActive));
      } catch {
        setError('Error al cargar datos. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filtrar doctores por especialidad seleccionada (client-side)
  const filteredDoctors = selectedSpecialtyId
    ? allDoctors.filter((d) => d.speciality?.specialityId === selectedSpecialtyId)
    : allDoctors;

  const currentDoctor = allDoctors.find((d) => d.id === selectedDoctorId);

  // Agrupar slots por fecha
  const slotsByDate = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  const availableDates = Object.keys(slotsByDate).sort();
  const pagedDates = availableDates.slice(
    datePageIndex * DATES_PER_PAGE,
    (datePageIndex + 1) * DATES_PER_PAGE
  );
  const totalDatePages = Math.ceil(availableDates.length / DATES_PER_PAGE);
  const currentDateSlots = selectedDate ? slotsByDate[selectedDate] || [] : [];

  // Handlers
  const handleSpecialtyChange = (specId) => {
    setSelectedSpecialtyId(specId);
    setSelectedDoctorId('');
    setSlots([]);
    setSelectedSlot(null);
    setSelectedDate('');
    setSlotsSearched(false);
    setDatePageIndex(0);
    setError('');
  };

  const handleDoctorChange = (docId) => {
    setSelectedDoctorId(docId);
    setSlots([]);
    setSelectedSlot(null);
    setSelectedDate('');
    setSlotsSearched(false);
    setDatePageIndex(0);
    setError('');
  };

  const handleSearchSlots = async () => {
    if (!selectedDoctorId) return;
    setLoadingSlots(true);
    setError('');
    setSelectedSlot(null);
    setSelectedDate('');
    setDatePageIndex(0);
    try {
      const data = await getFreeSlots(selectedDoctorId);
      setSlots(data || []);
      setSlotsSearched(true);
      if (data && data.length > 0) {
        const grouped = data.reduce((acc, s) => {
          if (!acc[s.date]) acc[s.date] = [];
          acc[s.date].push(s);
          return acc;
        }, {});
        const firstDate = Object.keys(grouped).sort()[0];
        setSelectedDate(firstDate);
      }
    } catch {
      setError('Error al buscar disponibilidad. Intente nuevamente.');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirmAppointment = async () => {
    if (!selectedSlot) return;
    if (reason.trim().length < 5) {
      setError('El motivo de consulta debe tener al menos 5 caracteres.');
      return;
    }
    const dni = localStorage.getItem('patientDni');
    if (!dni) {
      setError('No se encontró su DNI. Por favor, vuelva a iniciar sesión.');
      return;
    }
    setBooking(true);
    setError('');
    try {
      await bookAppointment(selectedDoctorId, selectedSlot.id, Number(dni), reason.trim());
      setBookedInfo({
        doctor: currentDoctor?.name,
        specialty: currentDoctor?.speciality?.name || '',
        date: formatFullDate(selectedSlot.date),
        time: formatTime(selectedSlot.startTime),
        dni,
      });
      setConfirmedModal(true);
      setSlots((prev) => prev.filter((s) => s.id !== selectedSlot.id));
      setSelectedSlot(null);
      setReason('');
    } catch (err) {
      const msg =
        err?.response?.data?.message || 'Error al reservar el turno. Intente nuevamente.';
      setError(msg);
    } finally {
      setBooking(false);
    }
  };

  const getDateRangeLabel = () => {
    if (pagedDates.length === 0) return '';
    const first = parseDate(pagedDates[0]);
    const last = parseDate(pagedDates[pagedDates.length - 1]);
    if (first.getMonth() === last.getMonth()) {
      return `${DAY_NAMES[first.getDay()]} ${first.getDate()} - ${DAY_NAMES[last.getDay()]} ${last.getDate()}, ${MONTH_NAMES[first.getMonth()]}`;
    }
    return `${first.getDate()} ${SHORT_MONTHS[first.getMonth()]} - ${last.getDate()} ${SHORT_MONTHS[last.getMonth()]}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-med-primary-900" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Error global */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-center">
          {error}
        </div>
      )}

      {/* 1. Selector de Especialidad y Doctor */}
      <Card className="p-6 sm:p-7">
        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-med-primary-900">
            Reservar Turno Médico
          </h1>
          <p className="text-xs sm:text-sm text-med-text-sub mt-1">
            Seleccione la especialidad y el profesional para continuar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Especialidad */}
          <div className="md:col-span-5 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-med-text-sub">
              Seleccionar Especialidad
            </label>
            <div className="relative">
              <select
                value={selectedSpecialtyId}
                onChange={(e) => handleSpecialtyChange(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 text-sm bg-white border border-med-border rounded-lg text-med-text-main focus:outline-none focus:ring-2 focus:ring-med-primary-600 pr-10 cursor-pointer"
              >
                <option value="">— Todas las especialidades —</option>
                {specialties.map((spec) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.name}
                  </option>
                ))}
              </select>
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-med-text-muted">
                ▼
              </span>
            </div>
          </div>

          {/* Doctor */}
          <div className="md:col-span-4 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-med-text-sub">
              Seleccionar Doctor
            </label>
            <div className="relative">
              <select
                value={selectedDoctorId}
                onChange={(e) => handleDoctorChange(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 text-sm bg-white border border-med-border rounded-lg text-med-text-main focus:outline-none focus:ring-2 focus:ring-med-primary-600 pr-10 cursor-pointer"
              >
                <option value="">— Seleccione un doctor —</option>
                {filteredDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name}
                  </option>
                ))}
              </select>
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-med-text-muted">
                ▼
              </span>
            </div>
          </div>

          {/* Buscar Disponibilidad */}
          <div className="md:col-span-3">
            <Button
              type="button"
              disabled={!selectedDoctorId || loadingSlots}
              className="w-full flex items-center justify-center gap-2 bg-med-primary-900 hover:bg-med-primary-800 text-white font-medium py-2.5 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSearchSlots}
            >
              {loadingSlots ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              )}
              <span>{loadingSlots ? 'Buscando...' : 'Buscar Disponibilidad'}</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. Info del Doctor (visible después de buscar) */}
      {currentDoctor && slotsSearched && (
        <Card className="p-5 sm:p-6 flex items-center gap-4 border-med-border">
          <div className="relative shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-med-primary-100 flex items-center justify-center text-3xl border border-med-primary-200">
              👨‍⚕️
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div className="overflow-hidden">
            <h2 className="text-base sm:text-lg font-bold text-med-primary-900">
              {currentDoctor.name}
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-med-primary-700 mt-0.5">
              {currentDoctor.speciality?.name}
            </p>
            <p className="text-xs text-med-text-muted mt-0.5">
              Matrícula: {currentDoctor.licenseNumber}
            </p>
          </div>
        </Card>
      )}

      {/* 3. Selector de Disponibilidad */}
      {slotsSearched && (
        <Card className="p-5 sm:p-6 border-med-border">
          {availableDates.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-med-text-muted">
                No hay turnos disponibles para este doctor en este momento.
              </p>
            </div>
          ) : (
            <>
              {/* Header con navegación */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-med-border-subtle">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={datePageIndex === 0}
                    onClick={() => setDatePageIndex((prev) => prev - 1)}
                    className="p-1 rounded-md border border-med-border hover:bg-gray-50 text-med-text-sub transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ‹
                  </button>
                  <span className="font-bold text-sm sm:text-base text-med-primary-900">
                    {getDateRangeLabel()}
                  </span>
                  <button
                    type="button"
                    disabled={datePageIndex >= totalDatePages - 1}
                    onClick={() => setDatePageIndex((prev) => prev + 1)}
                    className="p-1 rounded-md border border-med-border hover:bg-gray-50 text-med-text-sub transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ›
                  </button>
                </div>
                <div className="flex items-center gap-4 text-xs text-med-text-sub">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-med-primary-900" />
                    Disponible
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Seleccionado
                  </span>
                </div>
              </div>

              {/* DESKTOP: Grid de columnas por fecha */}
              <div
                className="hidden sm:grid gap-3 pt-5"
                style={{
                  gridTemplateColumns: `repeat(${pagedDates.length}, minmax(0, 1fr))`,
                }}
              >
                {pagedDates.map((date) => {
                  const dateSlots = slotsByDate[date] || [];
                  const d = parseDate(date);
                  return (
                    <div key={date} className="flex flex-col items-center gap-3">
                      <div className="text-center">
                        <span className="text-[11px] font-bold text-med-text-sub uppercase">
                          {SHORT_DAYS[d.getDay()]}
                        </span>
                        <p className="text-xl font-bold text-med-primary-900 leading-tight">
                          {d.getDate()}
                        </p>
                      </div>
                      <div className="w-full flex flex-col gap-2">
                        {dateSlots.map((slot) => {
                          const isSelected = selectedSlot?.id === slot.id;
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => {
                                setSelectedDate(date);
                                setSelectedSlot(slot);
                              }}
                              className={`w-full py-2 px-3 text-xs font-semibold rounded-lg border transition-all text-center ${
                                isSelected
                                  ? 'bg-emerald-400 text-white border-emerald-400 shadow-sm'
                                  : 'bg-white border-med-border text-med-primary-900 hover:border-med-primary-600 hover:bg-med-primary-50/50'
                              }`}
                            >
                              {formatTime(slot.startTime)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* MOBILE: Selector de días horizontal + grilla de horarios */}
              <div className="block sm:hidden pt-4 space-y-4">
                <div>
                  <span className="text-xs font-bold text-med-text-main mb-2 block">
                    Fechas Disponibles
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {availableDates.map((date) => {
                      const isActive = selectedDate === date;
                      const d = parseDate(date);
                      return (
                        <button
                          key={date}
                          type="button"
                          onClick={() => {
                            setSelectedDate(date);
                            setSelectedSlot(null);
                          }}
                          className={`flex-shrink-0 min-w-[68px] py-2.5 px-2 rounded-xl text-center border transition-all ${
                            isActive
                              ? 'bg-med-primary-900 text-white border-med-primary-900 shadow-sm'
                              : 'bg-white border-med-border text-med-text-main hover:bg-gray-50'
                          }`}
                        >
                          <span
                            className={`block text-[10px] font-bold uppercase ${
                              isActive ? 'text-white/80' : 'text-med-text-sub'
                            }`}
                          >
                            {SHORT_DAYS[d.getDay()]}
                          </span>
                          <span className="block text-base font-extrabold my-0.5">
                            {d.getDate()}
                          </span>
                          <span
                            className={`block text-[10px] uppercase ${
                              isActive ? 'text-white/80' : 'text-med-text-muted'
                            }`}
                          >
                            {SHORT_MONTHS[d.getMonth()]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-bold text-med-text-sub mb-2.5">
                    Horarios disponibles (Bloques de 30 min)
                  </span>
                  {currentDateSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {currentDateSlots.map((slot) => {
                        const isSelected = selectedSlot?.id === slot.id;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all ${
                              isSelected
                                ? 'border-2 border-med-primary-900 bg-white text-med-primary-900 font-bold shadow-xs'
                                : 'bg-white border-med-border text-med-text-main hover:bg-gray-50'
                            }`}
                          >
                            {formatTime(slot.startTime)}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 bg-gray-50 border border-med-border rounded-xl text-center">
                      <p className="text-xs text-med-text-muted">
                        No hay turnos disponibles para esta fecha.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </Card>
      )}

      {/* 4. Motivo de consulta + Confirmación */}
      {selectedSlot && (
        <div className="bg-med-primary-50 border border-med-primary-200/60 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="border-l-4 border-med-primary-900 pl-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-med-text-sub">
              Resumen de Selección
            </span>
            <p className="text-base sm:text-lg font-bold text-med-primary-900 mt-0.5 flex items-center gap-2">
              <span>📅</span>
              <span>
                {formatFullDate(selectedSlot.date)}, {formatTime(selectedSlot.startTime)} HS
              </span>
            </p>
            <p className="text-xs text-med-text-sub mt-0.5">
              {currentDoctor?.name} • {currentDoctor?.speciality?.name} • Duración: 30 min
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-med-text-sub">
              Motivo de consulta
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describa brevemente el motivo de su consulta (mínimo 5 caracteres)"
              rows={2}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-med-border rounded-lg text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-2 focus:ring-med-primary-600 resize-none"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              disabled={booking || reason.trim().length < 5}
              onClick={handleConfirmAppointment}
              className="flex items-center justify-center gap-2 bg-med-primary-900 hover:bg-med-primary-800 text-white font-medium py-3 px-6 rounded-xl shadow-md text-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {booking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Reservando...</span>
                </>
              ) : (
                <>
                  <span>Confirmar Turno</span>
                  <svg
                    className="w-5 h-5 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Confirmación Exitosa */}
      {confirmedModal && bookedInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              ✓
            </div>
            <h3 className="text-xl font-bold text-med-primary-900">
              ¡Turno Confirmado con Éxito!
            </h3>
            <p className="text-xs text-med-text-sub mt-2 leading-relaxed">
              Tu turno con{' '}
              <strong className="text-med-text-main">{bookedInfo.doctor}</strong> ha sido
              reservado para el{' '}
              <strong className="text-med-text-main">
                {bookedInfo.date} a las {bookedInfo.time} hs
              </strong>
              .
            </p>
            <div className="mt-5 p-3.5 bg-med-primary-50 border border-med-primary-200/60 rounded-xl text-xs text-med-primary-900 text-left space-y-1">
              <p>
                <strong>Especialidad:</strong> {bookedInfo.specialty}
              </p>
              <p>
                <strong>Paciente DNI:</strong> {bookedInfo.dni}
              </p>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button className="w-full text-xs py-2.5" onClick={() => navigate('/appointments')}>
                Ver Mis Turnos
              </Button>
              <Button
                variant="secondary"
                className="w-full text-xs py-2.5"
                onClick={() => {
                  setConfirmedModal(false);
                  setBookedInfo(null);
                }}
              >
                Reservar Otro
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientHome;