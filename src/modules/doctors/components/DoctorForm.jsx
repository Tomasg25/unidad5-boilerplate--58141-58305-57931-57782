import { useState, useEffect } from 'react';
import Button from '../../shared/components/Button';
import { getSpecialties } from '../../specialties/services/specialtiesService';

function DoctorForm({ isOpen, onClose, onSubmit, doctor }) {
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialityId, setSpecialityId] = useState('');
  const [specialties, setSpecialties] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(doctor);

  // Cuando se abre el modal, cargamos las especialidades del backend
  // y si estamos editando, llenamos los campos con los datos existentes.
  useEffect(() => {
    if (!isOpen) return;

    const fetchSpecialties = async () => {
      try {
        // Traemos hasta 100 especialidades para el dropdown
        const result = await getSpecialties(100, 1);

        setSpecialties(result.data || []);
      } catch {
        setSpecialties([]);
      }
    };

    fetchSpecialties();

    if (doctor) {
      setName(doctor.name);
      setLicenseNumber(doctor.licenseNumber);
      setSpecialityId(doctor.speciality?.specialityId || '');
    } else {
      setName('');
      setLicenseNumber('');
      setSpecialityId('');
    }

    setErrors({});
  }, [doctor, isOpen]);

  // Validaciones en el frontend que replican las del backend
  const validate = () => {
    const newErrors = {};

    if (!name || name.length < 3 || name.length > 100) {
      newErrors.name = 'El nombre debe tener entre 3 y 100 caracteres';
    }

    if (!licenseNumber || licenseNumber.trim() === '') {
      newErrors.licenseNumber = 'La matrícula es obligatoria';
    }

    if (!specialityId) {
      newErrors.specialityId = 'Debés seleccionar una especialidad';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit({ name, licenseNumber, specialityId });
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
          {isEditing ? 'Editar Doctor' : 'Nuevo Doctor'}
        </h3>
        <p className="text-xs text-med-text-sub mb-5">
          {isEditing
            ? 'Modificá los datos del profesional médico.'
            : 'Completá la información para registrar un nuevo profesional.'}
        </p>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Campo Nombre */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-med-text-sub">
              Nombre Completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Dr. Alejandro Rivera"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-med-border rounded-lg text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-2 focus:ring-med-primary-600"
            />
            {errors.name && (
              <span className="text-xs text-red-600">{errors.name}</span>
            )}
          </div>

          {/* Campo Matrícula */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-med-text-sub">
              Matrícula Profesional
            </label>
            <input
              type="text"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="Ej: MP-12345"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-med-border rounded-lg text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-2 focus:ring-med-primary-600"
            />
            {errors.licenseNumber && (
              <span className="text-xs text-red-600">
                {errors.licenseNumber}
              </span>
            )}
          </div>

          {/* Campo Especialidad (dropdown) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-med-text-sub">
              Especialidad
            </label>
            <select
              value={specialityId}
              onChange={(e) => setSpecialityId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-med-border rounded-lg text-med-text-main focus:outline-none focus:ring-2 focus:ring-med-primary-600"
            >
              <option value="">-- Seleccionar especialidad --</option>
              {specialties.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.name}
                </option>
              ))}
            </select>
            {errors.specialityId && (
              <span className="text-xs text-red-600">
                {errors.specialityId}
              </span>
            )}
          </div>

          {/* Botones */}
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
                  : 'Crear Doctor'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DoctorForm;
