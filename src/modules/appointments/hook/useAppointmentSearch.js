import { useState, useEffect } from 'react';
import { getSpecialties } from '../../specialties/services/specialtiesService';
import { getDoctors } from '../../doctors/services/doctorsService';
import { searchAppointments } from '../services/appointmentsService';

const DAY_NAMES = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles',
  'Jueves', 'Viernes', 'Sábado',
];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return `${DAY_NAMES[d.getDay()]} ${day} de ${MONTH_NAMES[month - 1]}`;
}

const PAGE_SIZE = 10;

export default function useAppointmentSearch() {
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [dniFilter, setDniFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
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
      const data = await searchAppointments(filters, PAGE_SIZE, page);
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

  const totalPages = Math.ceil(total / PAGE_SIZE);

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

  return {
    specialties,
    doctors,
    dniFilter,
    setDniFilter,
    specialtyFilter,
    setSpecialtyFilter,
    doctorFilter,
    setDoctorFilter,
    dateFilter,
    setDateFilter,
    results,
    total,
    totalPages,
    pageIndex,
    loading,
    loadingFilters,
    error,
    searched,
    activeFilters,
    handleSearch,
    handleClear,
    formatDate,
    PAGE_SIZE,
  };
}
