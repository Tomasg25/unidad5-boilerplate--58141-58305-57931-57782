import { useState, useEffect, useCallback } from 'react';
import {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  toggleDoctorStatus,
} from '../services/doctorsService';

const PAGE_SIZE = 5;

export default function useDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDoctors(PAGE_SIZE, pageIndex, searchTerm);

      setDoctors(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar los doctores');
    } finally {
      setLoading(false);
    }
  }, [pageIndex, searchTerm]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPageIndex(1);
  };

  const handleCreate = async (data) => {
    await createDoctor(data.name, data.licenseNumber, data.specialityId);
    setPageIndex(1);
    await fetchDoctors();
  };

  const handleUpdate = async (id, data) => {
    await updateDoctor(id, data.name, data.licenseNumber, data.specialityId);
    await fetchDoctors();
  };

  const handleDelete = async (id) => {
    await deleteDoctor(id);
    await fetchDoctors();
  };

  const handleToggleStatus = async (doctorId) => {
    setTogglingId(doctorId);
    try {
      const updated = await toggleDoctorStatus(doctorId);

      setDoctors((prev) =>
        prev.map((doc) =>
          doc.id === doctorId ? { ...doc, isActive: updated.isActive } : doc
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message || 'Error al cambiar el estado del doctor'
      );
    } finally {
      setTogglingId(null);
    }
  };

  return {
    doctors,
    total,
    totalPages,
    pageIndex,
    setPageIndex,
    searchTerm,
    loading,
    error,
    setError,
    togglingId,
    handleSearch,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleStatus,
    PAGE_SIZE,
  };
}
