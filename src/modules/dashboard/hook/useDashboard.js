import { useState, useEffect } from 'react';
import { getDoctors } from '../../doctors/services/doctorsService';
import { getSpecialties } from '../../specialties/services/specialtiesService';
import { searchAppointments } from '../../appointments/services/appointmentsService';

const PAGE_SIZE = 5;

export default function useDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [doctorPage, setDoctorPage] = useState(1);
  const [activeDoctorsCount, setActiveDoctorsCount] = useState(0);
  const [activeSpecialtiesCount, setActiveSpecialtiesCount] = useState(0);
  const [todayAppointmentsCount, setTodayAppointmentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        setActiveSpecialtiesCount(
          allSpecialties.filter((s) => s.isActive).length
        );
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

  return {
    pagedDoctors,
    totalDoctors,
    totalDoctorPages,
    doctorPage,
    setDoctorPage,
    activeDoctorsCount,
    activeSpecialtiesCount,
    todayAppointmentsCount,
    loading,
    error,
    PAGE_SIZE,
  };
}