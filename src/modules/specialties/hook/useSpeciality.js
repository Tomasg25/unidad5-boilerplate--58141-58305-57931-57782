import { useState, useEffect, useCallback } from 'react';
import {
  getSpecialties,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
  toggleSpecialtyStatus,
} from '../services/specialtiesService';

const PAGE_SIZE = 5;

export default function useSpecialties() {
  const [specialties, setSpecialties] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const fetchSpecialties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSpecialties(PAGE_SIZE, pageIndex, searchTerm);

      setSpecialties(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Error al cargar las especialidades'
      );
    } finally {
      setLoading(false);
    }
  }, [pageIndex, searchTerm]);

  useEffect(() => {
    fetchSpecialties();
  }, [fetchSpecialties]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPageIndex(1);
  };

  const handleCreate = async (data) => {
    await createSpecialty(data.name, data.description);
    setPageIndex(1);
    await fetchSpecialties();
  };

  const handleUpdate = async (id, data) => {
    await updateSpecialty(id, data.name, data.description);
    await fetchSpecialties();
  };

  const handleDelete = async (id) => {
    await deleteSpecialty(id);
    await fetchSpecialties();
  };

  const handleToggleStatus = async (specId) => {
    setTogglingId(specId);
    try {
      const updated = await toggleSpecialtyStatus(specId);

      setSpecialties((prev) =>
        prev.map((spec) =>
          spec.id === specId ? { ...spec, isActive: updated.isActive } : spec
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar el estado');
    } finally {
      setTogglingId(null);
    }
  };

  return {
    specialties,
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
