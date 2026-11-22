import { useState, useEffect } from 'react';
import Button from '../../shared/components/Button';
import Input from '../../shared/components/Input';

//Formulario de creacion y edicion de Especialidades
function SpecialtyForm({ isOpen, onClose, onSubmit, specialty }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(specialty);

  useEffect(() => {
    if (specialty) {
      setName(specialty.name);
      setDescription(specialty.description);
    } else {
      setName('');
      setDescription('');
    }

    setErrors({});
  }, [specialty, isOpen]);

  const validate = () => {
    const newErrors = {};

    if (!name || name.length < 3 || name.length > 100) {
      newErrors.name = 'El nombre debe tener entre 3 y 100 caracteres';
    }

    if (!description || description.length < 10 || description.length > 100) {
      newErrors.description =
        'La descripción debe tener entre 10 y 100 caracteres';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit({ name, description });
      onClose();
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Ocurrió un error al guardar';

      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8">
        <h3 className="text-xl font-bold text-med-primary-900 mb-1">
          {isEditing ? 'Editar Especialidad' : 'Nueva Especialidad'}
        </h3>
        <p className="text-xs text-med-text-sub mb-5">
          {isEditing
            ? 'Modificá los datos de la especialidad.'
            : 'Completá la información para registrar una nueva especialidad.'}
        </p>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-med-text-sub">
              Nombre de la Especialidad
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Cardiología"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-med-border rounded-lg text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-2 focus:ring-med-primary-600"
            />
            {errors.name && (
              <span className="text-xs text-red-600">{errors.name}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-med-text-sub">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de la especialidad (mín. 10 caracteres)"
              rows={3}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-med-border rounded-lg text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-2 focus:ring-med-primary-600 resize-none"
            />
            {errors.description && (
              <span className="text-xs text-red-600">{errors.description}</span>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="w-full text-xs py-2.5"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full text-xs py-2.5 bg-med-primary-900 hover:bg-med-primary-800 text-white"
              disabled={loading}
            >
              {loading
                ? 'Guardando...'
                : isEditing
                  ? 'Guardar Cambios'
                  : 'Crear Especialidad'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SpecialtyForm;
