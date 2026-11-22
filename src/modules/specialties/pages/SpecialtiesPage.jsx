import { useState } from 'react';
import Button from '../../shared/components/Button';
import DataTable from '../../shared/components/DataTable';
import ToggleSwitch from '../../shared/components/ToggleSwitch';
import StatusBadge from '../../shared/components/StatusBadge';
import PageHeader from '../../shared/components/PageHeader';
import ConfirmModal from '../../shared/components/ConfirmModal';
import SpecialtyForm from '../components/SpecialityForm';
import useSpeciality from '../hook/useSpeciality';

function SpecialtiesPage() {
  const {
    specialties,
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
  } = useSpeciality();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleOpenEdit = (spec) => {
    setEditingSpecialty(spec);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await handleDelete(deleteTarget.id);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Error al eliminar la especialidad'
      );
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      header: 'Nombre',
      render: (spec) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-med-primary-100 text-med-primary-700 flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.75"
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
          <span className="font-semibold text-med-primary-900">
            {spec.name}
          </span>
        </div>
      ),
    },
    {
      header: 'Descripción',
      render: (spec) => (
        <span className="text-med-text-sub">{spec.description}</span>
      ),
    },
    {
      header: 'Estado',
      align: 'center',
      render: (spec) => (
        <StatusBadge
          label={spec.isActive ? 'Activa' : 'Inactiva'}
          variant={spec.isActive ? 'active' : 'inactive'}
        />
      ),
    },
    {
      header: 'Acciones',
      align: 'center',
      render: (spec) => (
        <div className="flex items-center justify-end gap-3">
          <ToggleSwitch
            checked={spec.isActive}
            onChange={() => handleToggleStatus(spec.id)}
            disabled={togglingId === spec.id}
          />
          <button
            title="Editar especialidad"
            className="p-1.5 rounded-lg hover:bg-med-primary-50 text-med-text-muted hover:text-med-primary-900 transition"
            onClick={() => handleOpenEdit(spec)}
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
            title="Eliminar especialidad"
            className="p-1.5 rounded-lg hover:bg-red-50 text-med-text-muted hover:text-med-danger-text transition"
            onClick={() => setDeleteTarget(spec)}
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
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Directorio de Especialidades"
        subtitle="Administre las categorías médicas, servicios y disponibilidad del personal especializado."
      >
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
            placeholder="Buscar especialidad (mín. 3 letras)..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-med-border rounded-lg text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-1 focus:ring-med-primary-600"
          />
        </div>
        <Button
          onClick={() => {
            setEditingSpecialty(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-1.5"
        >
          <span>+</span>
          <span>Nueva Especialidad</span>
        </Button>
      </PageHeader>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {error}
        </div>
      )}
      <DataTable
        title="Registros de Especialidades"
        columns={columns}
        data={specialties}
        loading={loading}
        loadingText="Cargando especialidades..."
        emptyText="No se encontraron especialidades."
        rowKey={(spec) => spec.id}
        currentPage={pageIndex}
        totalPages={totalPages}
        totalItems={specialties.length}
        pageSize={PAGE_SIZE}
        onPageChange={(page) => setPageIndex(page)}
      />
      <SpecialtyForm
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingSpecialty(null);
        }}
        onSubmit={
          editingSpecialty
            ? (data) => handleUpdate(editingSpecialty.id, data)
            : handleCreate
        }
        specialty={editingSpecialty}
      />
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Especialidad"
        confirmText="Sí, Eliminar"
        loading={deleting}
        variant="danger"
      >
        ¿Estás seguro de que querés eliminar{' '}
        <strong>{deleteTarget?.name}</strong>? Esta acción no se puede deshacer.
      </ConfirmModal>
    </div>
  );
}
export default SpecialtiesPage;
