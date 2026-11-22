import { useState, useEffect } from 'react';
import { getSpecialties } from '../../specialties/services/specialtiesService';
import { getDoctors } from '../../doctors/services/doctorsService';
import {
  getFreeSlots,
  bookAppointment,
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
const SHORT_DAYS = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
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
const SHORT_MONTHS = [
  'ENE',
  'FEB',
  'MAR',
  'ABR',
  'MAY',
  'JUN',
  'JUL',
  'AGO',
  'SEP',
  'OCT',
  'NOV',
  'DIC',
];

function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${y}-${m}-${day}`;
}

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

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);

  return d;
}

function getWeekDays(monday) {
  const days = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);

    d.setDate(monday.getDate() + i);
    days.push(d);
  }

  return days;
}

export default function useBooking() {
  const [specialties, setSpecialties] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [slots, setSlots] = useState([]);

  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [slotsSearched, setSlotsSearched] = useState(false);
  const [error, setError] = useState('');
  const [bookedInfo, setBookedInfo] = useState(null);

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

  const filteredDoctors = selectedSpecialtyId
    ? allDoctors.filter(
        (d) => d.speciality?.specialityId === selectedSpecialtyId
      )
    : allDoctors;

  const currentDoctor = allDoctors.find((d) => d.id === selectedDoctorId);

  const slotsByDate = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];

    acc[slot.date].push(slot);

    return acc;
  }, {});

  const today = new Date();

  today.setHours(0, 0, 0, 0);
  const currentMonday = getMonday(today);
  const displayMonday = new Date(currentMonday);

  displayMonday.setDate(displayMonday.getDate() + weekOffset * 7);
  const weekDays = getWeekDays(displayMonday);

  const weekLabel = (() => {
    const first = weekDays[0];
    const last = weekDays[6];

    if (first.getMonth() === last.getMonth()) {
      return `${first.getDate()} - ${last.getDate()} de ${MONTH_NAMES[first.getMonth()]}`;
    }

    return `${first.getDate()} ${SHORT_MONTHS[first.getMonth()]} - ${last.getDate()} ${SHORT_MONTHS[last.getMonth()]}`;
  })();

  const currentDateSlots = selectedDate ? slotsByDate[selectedDate] || [] : [];

  const resetSelection = () => {
    setSlots([]);
    setSelectedSlot(null);
    setSelectedDate('');
    setSlotsSearched(false);
    setWeekOffset(0);
    setError('');
  };

  const handleSpecialtyChange = (specId) => {
    setSelectedSpecialtyId(specId);
    setSelectedDoctorId('');
    resetSelection();
  };

  const handleDoctorChange = (docId) => {
    setSelectedDoctorId(docId);
    resetSelection();
  };

  const handleSearchSlots = async () => {
    if (!selectedDoctorId) return;

    setLoadingSlots(true);
    setError('');
    setSelectedSlot(null);
    setSelectedDate('');
    setWeekOffset(0);
    try {
      const data = await getFreeSlots(selectedDoctorId);

      setSlots(data || []);
      setSlotsSearched(true);
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
      await bookAppointment(
        selectedDoctorId,
        selectedSlot.id,
        Number(dni),
        reason.trim()
      );
      setBookedInfo({
        doctor: currentDoctor?.name,
        specialty: currentDoctor?.speciality?.name || '',
        date: formatFullDate(selectedSlot.date),
        time: formatTime(selectedSlot.startTime),
        dni,
      });
      setSlots((prev) => prev.filter((s) => s.id !== selectedSlot.id));
      setSelectedSlot(null);
      setReason('');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Error al reservar el turno. Intente nuevamente.';

      setError(msg);
    } finally {
      setBooking(false);
    }
  };

  const clearBookedInfo = () => setBookedInfo(null);

  return {
    specialties,
    filteredDoctors,
    currentDoctor,
    slots,
    slotsByDate,
    selectedSpecialtyId,
    selectedDoctorId,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    reason,
    setReason,
    weekOffset,
    setWeekOffset,
    weekDays,
    weekLabel,
    today,
    currentDateSlots,
    loading,
    loadingSlots,
    booking,
    slotsSearched,
    error,
    bookedInfo,
    handleSpecialtyChange,
    handleDoctorChange,
    handleSearchSlots,
    handleConfirmAppointment,
    clearBookedInfo,
    toDateStr,
    formatFullDate,
    formatTime,
    SHORT_DAYS,
  };
}
