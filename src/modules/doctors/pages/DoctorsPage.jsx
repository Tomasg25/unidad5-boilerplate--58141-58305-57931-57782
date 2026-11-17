import { useState, useEffect, useCallback } from 'react';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import TablePagination from '../../shared/components/TablePagination';
import ToggleSwitch from '../../shared/components/ToggleSwitch';
import DoctorForm from '../components/DoctorForm';
import AvailabilityModal from '../components/AvailabilityModal';
import {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  toggleDoctorStatus,
} from '../services/doctorsService';

const PAGE_SIZE = 5;

function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [availabilityDoctorId, setAvailabilityDoctorId] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleCreate = async ({ name, licenseNumber, specialityId }) => {
    await createDoctor(name, licenseNumber, specialityId);
    setPageIndex(1);
    await fetchDoctors();
  };

  const handleOpenEdit = (doc) => {
    setEditingDoctor(doc);
    setModalOpen(true);
  };

  const handleUpdate = async ({ name, licenseNumber, specialityId }) => {
    await updateDoctor(editingDoctor.id, name, licenseNumber, specialityId);
    await fetchDoctors();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDoctor(deleteTarget.id);
      await fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar el doctor');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
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

  return (
    <div className="flex flex-col gap-6">
      {/* Cabecera */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-med-text-main">
            Directorio de Doctores
          </h1>
          <p className="text-sm text-med-text-sub mt-1">
            Gestione el personal médico y supervise su disponibilidad actual.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-med-text-muted">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar doctor (mín. 3 letras)..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-med-border rounded-lg text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-1 focus:ring-med-primary-600"
            />
          </div>

          <Button
            onClick={() => {
              setAvailabilityDoctorId(null);
              setAvailabilityOpen(true);
            }}
            className="flex items-center gap-2 bg-med-primary-900 hover:bg-med-primary-800 text-white"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Gestionar Disponibilidad</span>
          </Button>

          <Button
            onClick={() => {
              setEditingDoctor(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-med-primary-700 hover:bg-med-primary-800 text-white"
          >
            <span>+</span>
            <span>Nuevo Doctor</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Tabla */}
      <Card className="p-0 overflow-hidden border-med-border">
        <div className="p-5 border-b border-med-border">
          <h2 className="text-base font-bold text-med-primary-900">
            Registros de Doctores
          </h2>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-med-text-muted">
            Cargando doctores...
          </div>
        ) : doctors.length === 0 ? (
          <div className="p-10 text-center text-sm text-med-text-muted">
            No se encontraron doctores.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-med-primary-50/70 text-[11px] uppercase tracking-wider text-med-text-sub border-b border-med-border">
                <tr>
                  <th className="px-6 py-3.5">Nombre del Doctor</th>
                  <th className="px-6 py-3.5">Matrícula</th>
                  <th className="px-6 py-3.5">Especialidad</th>
                  <th className="px-6 py-3.5 text-center">Estado</th>
                  <th className="px-6 py-3.5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-med-border-subtle">
                {doctors.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    {/* Nombre */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-med-primary-100 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-med-primary-700"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.75"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <p className="font-semibold text-med-primary-900 leading-tight">
                          {doc.name}
                        </p>
                      </div>
                    </td>

                    {/* Matrícula */}
                    <td className="px-6 py-4 text-med-text-sub">
                      {doc.licenseNumber}
                    </td>

                    {/* Especialidad */}
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-med-primary-100 text-med-primary-700">
                        {doc.speciality?.name || 'Sin especialidad'}
                      </span>
                    </td>

                    {/* Estado — solo texto */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                          doc.isActive ? 'text-emerald-600' : 'text-gray-400'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            doc.isActive ? 'bg-emerald-500' : 'bg-gray-400'
                          }`}
                        />
                        {doc.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    {/* Acciones — switch + editar + eliminar */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <ToggleSwitch
                          checked={doc.isActive}
                          onChange={() => handleToggleStatus(doc.id)}
                          disabled={togglingId === doc.id}
                        />
                        <button
                          title="Editar profesional"
                          className="p-1.5 rounded-lg hover:bg-med-primary-50 text-med-primary-600 hover:text-med-primary-900 transition"
                          onClick={() => handleOpenEdit(doc)}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                        <button
                          title="Eliminar profesional"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-med-danger-text transition"
                          onClick={() => setDeleteTarget(doc)}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <TablePagination
          currentPage={pageIndex}
          totalPages={totalPages}
          totalItems={total}
          pageSize={PAGE_SIZE}
          onPageChange={(page) => setPageIndex(page)}
        />
      </Card>

      {/* Modal Crear/Editar Doctor */}
      <DoctorForm
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingDoctor(null);
        }}
        onSubmit={editingDoctor ? handleUpdate : handleCreate}
        doctor={editingDoctor}
      />

      {/* Modal Confirmar Eliminación */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-med-primary-900">
              Eliminar Doctor
            </h3>
            <p className="text-xs text-med-text-sub mt-2">
              ¿Estás seguro de que querés eliminar a{' '}
              <strong>{deleteTarget.name}</strong>? Esta acción no se puede
              deshacer.
            </p>
            <div className="flex gap-3 mt-5">
              <Button
                variant="secondary"
                className="w-full text-xs py-2.5"
                onClick={() => setDeleteTarget(null)}
              >
                Cancelar
              </Button>
              <Button
                className="w-full text-xs py-2.5 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Eliminando...' : 'Sí, Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Disponibilidad Horaria */}
      <AvailabilityModal
        isOpen={availabilityOpen}
        onClose={() => {
          setAvailabilityOpen(false);
          setAvailabilityDoctorId(null);
        }}
        preselectedDoctorId={availabilityDoctorId}
      />
    </div>
  );
}

export default DoctorsPage;