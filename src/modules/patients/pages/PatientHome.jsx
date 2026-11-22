import { useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import useBooking from '../hook/useBooking';

function PatientHome() {
  const navigate = useNavigate();
  const {
    specialties, filteredDoctors, currentDoctor, slots, slotsByDate,
    selectedSpecialtyId, selectedDoctorId,
    selectedDate, setSelectedDate,
    selectedSlot, setSelectedSlot,
    reason, setReason,
    weekOffset, setWeekOffset,
    weekDays, weekLabel, today, currentDateSlots,
    loading, loadingSlots, booking, slotsSearched, error,
    bookedInfo,
    handleSpecialtyChange, handleDoctorChange,
    handleSearchSlots, handleConfirmAppointment, clearBookedInfo,
    toDateStr, formatFullDate, formatTime, SHORT_DAYS,
  } = useBooking();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-med-primary-900" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
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
          <div className="md:col-span-5 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-med-text-sub">Seleccionar Especialidad</label>
            <div className="relative">
              <select
                value={selectedSpecialtyId}
                onChange={(e) => handleSpecialtyChange(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 text-sm bg-white border border-med-border rounded-lg text-med-text-main focus:outline-none focus:ring-2 focus:ring-med-primary-600 pr-10 cursor-pointer"
              >
                <option value="">— Todas las especialidades —</option>
                {specialties.map((spec) => (
                  <option key={spec.id} value={spec.id}>{spec.name}</option>
                ))}
              </select>
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-med-text-muted">▼</span>
            </div>
          </div>
          <div className="md:col-span-4 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-med-text-sub">Seleccionar Doctor</label>
            <div className="relative">
              <select
                value={selectedDoctorId}
                onChange={(e) => handleDoctorChange(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 text-sm bg-white border border-med-border rounded-lg text-med-text-main focus:outline-none focus:ring-2 focus:ring-med-primary-600 pr-10 cursor-pointer"
              >
                <option value="">— Seleccione un doctor —</option>
                {filteredDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>{doc.name}</option>
                ))}
              </select>
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-med-text-muted">▼</span>
            </div>
          </div>
          <div className="md:col-span-3">
            <Button
              type="button"
              disabled={!selectedDoctorId || loadingSlots}
              className="w-full flex items-center justify-center gap-2"
              onClick={handleSearchSlots}
            >
              {loadingSlots ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
              <span>{loadingSlots ? 'Buscando...' : 'Buscar Disponibilidad'}</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. Info del Doctor */}
      {currentDoctor && slotsSearched && (
        <Card className="p-5 sm:p-6 flex items-center gap-4 border-med-border">
          <div className="relative shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-med-primary-100 flex items-center justify-center text-3xl border border-med-primary-200">
              <svg className="w-8 h-8 text-med-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div className="overflow-hidden">
            <h2 className="text-base sm:text-lg font-bold text-med-primary-900">{currentDoctor.name}</h2>
            <p className="text-xs sm:text-sm font-semibold text-med-primary-700 mt-0.5">{currentDoctor.speciality?.name}</p>
            <p className="text-xs text-med-text-muted mt-0.5">Matrícula: {currentDoctor.licenseNumber}</p>
          </div>
        </Card>
      )}

      {/* 3. Calendario Semanal */}
      {slotsSearched && (
        <Card className="p-5 sm:p-6 border-med-border">
          {slots.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-med-text-muted">
                No hay turnos disponibles para este doctor en este momento.
              </p>
            </div>
          ) : (
            <>
              {/* Header con navegación por semana */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-med-border-subtle">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={weekOffset === 0}
                    onClick={() => { setWeekOffset((w) => w - 1); setSelectedSlot(null); }}
                    className="p-1.5 rounded-md border border-med-border hover:bg-gray-50 text-med-text-sub transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ‹
                  </button>
                  <span className="font-bold text-sm sm:text-base text-med-primary-900">
                    {weekLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setWeekOffset((w) => w + 1); setSelectedSlot(null); }}
                    className="p-1.5 rounded-md border border-med-border hover:bg-gray-50 text-med-text-sub transition"
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
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gray-200" />
                    Sin turnos
                  </span>
                </div>
              </div>

              {/* DESKTOP: Grid de 7 columnas */}
              <div className="hidden sm:grid grid-cols-7 gap-2 pt-5">
                {weekDays.map((day) => {
                  const dateStr = toDateStr(day);
                  const daySlots = slotsByDate[dateStr] || [];
                  const isPast = day < today;
                  const isToday = toDateStr(day) === toDateStr(today);

                  return (
                    <div key={dateStr} className="flex flex-col items-center gap-2">
                      <div className={`text-center w-full py-2 rounded-lg ${isToday ? 'bg-med-primary-900 text-white' : ''}`}>
                        <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-white/80' : 'text-med-text-sub'}`}>
                          {SHORT_DAYS[day.getDay()]}
                        </span>
                        <p className={`text-lg font-bold leading-tight ${isToday ? 'text-white' : isPast ? 'text-gray-300' : 'text-med-primary-900'}`}>
                          {day.getDate()}
                        </p>
                      </div>
                      <div className="w-full flex flex-col gap-1.5 min-h-[60px]">
                        {isPast ? (
                          <div className="flex-1 flex items-center justify-center">
                            <span className="text-[10px] text-gray-300">—</span>
                          </div>
                        ) : daySlots.length === 0 ? (
                          <div className="flex-1 flex items-center justify-center rounded-lg border border-dashed border-med-border bg-gray-50/50 py-3">
                            <span className="text-[10px] text-med-text-muted">Sin turnos</span>
                          </div>
                        ) : (
                          daySlots.map((slot) => {
                            const isSelected = selectedSlot?.id === slot.id;
                            return (
                              <button
                                key={slot.id}
                                type="button"
                                onClick={() => {
                                  setSelectedDate(dateStr);
                                  setSelectedSlot(slot);
                                }}
                                className={`w-full py-1.5 px-1 text-xs font-semibold rounded-lg border transition-all text-center ${
                                  isSelected
                                    ? 'bg-emerald-400 text-white border-emerald-400 shadow-sm'
                                    : 'bg-white border-med-border text-med-primary-900 hover:border-med-primary-600 hover:bg-med-primary-50/50'
                                }`}
                              >
                                {formatTime(slot.startTime)}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* MOBILE: Selector de días + grilla de horarios */}
              <div className="block sm:hidden pt-4 space-y-4">
                <div>
                  <span className="text-xs font-bold text-med-text-main mb-2 block">
                    Días de la semana
                  </span>
                  <div className="grid grid-cols-7 gap-1.5">
                    {weekDays.map((day) => {
                      const dateStr = toDateStr(day);
                      const daySlots = slotsByDate[dateStr] || [];
                      const isPast = day < today;
                      const isActive = selectedDate === dateStr;
                      const hasSlots = daySlots.length > 0;

                      return (
                        <button
                          key={dateStr}
                          type="button"
                          disabled={isPast || !hasSlots}
                          onClick={() => {
                            setSelectedDate(dateStr);
                            setSelectedSlot(null);
                          }}
                          className={`py-2 px-1 rounded-xl text-center border transition-all ${
                            isActive
                              ? 'bg-med-primary-900 text-white border-med-primary-900 shadow-sm'
                              : isPast || !hasSlots
                                ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                                : 'bg-white border-med-border text-med-text-main hover:bg-gray-50'
                          }`}
                        >
                          <span className={`block text-[9px] font-bold uppercase ${isActive ? 'text-white/80' : 'text-med-text-sub'}`}>
                            {SHORT_DAYS[day.getDay()]}
                          </span>
                          <span className={`block text-sm font-extrabold my-0.5 ${isPast && !isActive ? 'text-gray-300' : ''}`}>
                            {day.getDate()}
                          </span>
                          {hasSlots && !isPast && (
                            <span className={`block w-1.5 h-1.5 rounded-full mx-auto ${isActive ? 'bg-white' : 'bg-emerald-400'}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedDate && (
                  <div>
                    <span className="block text-xs font-bold text-med-text-sub mb-2.5">
                      Horarios disponibles — {formatFullDate(selectedDate)}
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
                        <p className="text-xs text-med-text-muted">No hay turnos disponibles para esta fecha.</p>
                      </div>
                    )}
                  </div>
                )}

                {!selectedDate && (
                  <div className="p-6 bg-gray-50 border border-med-border rounded-xl text-center">
                    <p className="text-xs text-med-text-muted">Seleccioná un día para ver los horarios disponibles.</p>
                  </div>
                )}
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
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                {formatFullDate(selectedSlot.date)}, {formatTime(selectedSlot.startTime)} HS
              </span>
            </p>
            <p className="text-xs text-med-text-sub mt-0.5">
              {currentDoctor?.name} - {currentDoctor?.speciality?.name} - Duración: 30 min
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-med-text-sub">Motivo de consulta</label>
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
              className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl shadow-md text-sm shrink-0"
            >
              {booking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Reservando...</span>
                </>
              ) : (
                <>
                  <span>Confirmar Turno</span>
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Confirmación Exitosa */}
      {bookedInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-med-primary-900">¡Turno Confirmado con Éxito!</h3>
            <p className="text-xs text-med-text-sub mt-2 leading-relaxed">
              Tu turno con{' '}
              <strong className="text-med-text-main">{bookedInfo.doctor}</strong> ha sido
              reservado para el{' '}
              <strong className="text-med-text-main">{bookedInfo.date} a las {bookedInfo.time} hs</strong>.
            </p>
            <div className="mt-5 p-3.5 bg-med-primary-50 border border-med-primary-200/60 rounded-xl text-xs text-med-primary-900 text-left space-y-1">
              <p><strong>Especialidad:</strong> {bookedInfo.specialty}</p>
              <p><strong>Paciente DNI:</strong> {bookedInfo.dni}</p>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button className="w-full text-xs py-2.5" onClick={() => navigate('/appointments')}>
                Ver Mis Turnos
              </Button>
              <Button
                variant="secondary"
                className="w-full text-xs py-2.5"
                onClick={clearBookedInfo}
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