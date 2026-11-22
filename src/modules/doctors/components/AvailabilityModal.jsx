import { useState, useEffect } from 'react';
import Button from '../../shared/components/Button';
import { getDoctors } from '../services/doctorsService';
import {
  getAvailabilities,
  createAvailability,
  updateAvailability,
} from '../services/availabilitiesService';
const DAYS_OPTIONS = [
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES',
  'SABADO',
  'DOMINGO',
];
const EMPTY_ROW = { day: '', startTime: '', endTime: '' };
function AvailabilityModal({ isOpen, onClose, preselectedDoctorId }) {

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [rows, setRows] = useState([{ ...EMPTY_ROW }]);
  const [hasExisting, setHasExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Al abrir: cargar lista de doctores para el dropdown
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setSuccess(null);
    const fetchDoctors = async () => {
      try {
        const result = await getDoctors(100, 1);
        setDoctors(result.data || []);
      } catch {
        setDoctors([]);
      }
    };
    fetchDoctors();
    if (preselectedDoctorId) {
      setSelectedDoctorId(preselectedDoctorId);
    } else {
      setSelectedDoctorId('');
      setRows([{ ...EMPTY_ROW }]);
      setHasExisting(false);
    }
  }, [isOpen, preselectedDoctorId]);

  // Cuando cambia el doctor seleccionado: cargar su disponibilidad actual
  useEffect(() => {
    if (!selectedDoctorId || !isOpen) return;
    const fetchAvailability = async () => {
      setLoadingData(true);
      setError(null);
      try {
        const data = await getAvailabilities(selectedDoctorId);
        if (data && data.length > 0) {
          // El doctor ya tiene horarios configurados: los mostramos para editar
          setRows(
            data.map((item) => ({
              day: item.day,
              startTime: item.startTime,
              endTime: item.endTime,
            }))
          );
          setHasExisting(true);
        } else {
          // No tiene: empezamos con una fila vacía
          setRows([{ ...EMPTY_ROW }]);
          setHasExisting(false);
        }
      } catch {
        setRows([{ ...EMPTY_ROW }]);
        setHasExisting(false);
      } finally {
        setLoadingData(false);
      }
    };
    fetchAvailability();
  }, [selectedDoctorId, isOpen]);
  
  // Agregar una fila nueva al formulario
  const addRow = () => {
    setRows([...rows, { ...EMPTY_ROW }]);
  };
  // Quitar una fila
  const removeRow = (index) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };
  // Actualizar un campo de una fila específica
  const updateRow = (index, field, value) => {
    const updated = rows.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    setRows(updated);
  };
  // Validar antes de enviar
  const validate = () => {
    for (const row of rows) {
      if (!row.day) return 'Todos los días deben estar seleccionados';
      if (!row.startTime) return 'Todos los horarios de inicio son obligatorios';
      if (!row.endTime) return 'Todos los horarios de fin son obligatorios';
      if (row.startTime >= row.endTime)
        return `El horario de inicio debe ser menor al de fin (${row.day})`;
    }
    // Verificar días duplicados
    const days = rows.map((r) => r.day);
    if (new Set(days).size !== days.length) {
      return 'No se puede repetir el mismo día';
    }
    return null;
  };
  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const days = rows.map((r) => ({
        day: r.day,
        startTime: r.startTime,
        endTime: r.endTime,
      }));
      if (hasExisting) {
        // Si ya tenía disponibilidad: PUT (reemplazar)
        await updateAvailability(selectedDoctorId, days);
      } else {
        // Si no tenía: POST (crear)
        await createAvailability(selectedDoctorId, days);
      }
      setSuccess('Disponibilidad guardada correctamente');
      setHasExisting(true);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Error al guardar la disponibilidad'
      );
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-med-primary-900 mb-1">
          Gestionar Disponibilidad Horaria
        </h3>
        <p className="text-xs text-med-text-sub mb-5">
          Definí los días y horarios de atención del profesional. El sistema
          genera automáticamente los turnos de 30 minutos.
        </p>
        {/* Mensajes */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700">
            {success}
          </div>
        )}
        {/* Selector de Doctor */}
        <div className="flex flex-col gap-1.5 mb-5">
          <label className="text-xs font-semibold text-med-text-sub">
            Seleccionar Doctor
          </label>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-med-border rounded-lg text-med-text-main focus:outline-none focus:ring-2 focus:ring-med-primary-600"
          >
            <option value="">-- Elegir doctor --</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} — {doc.speciality?.name || 'Sin especialidad'}
              </option>
            ))}
          </select>
        </div>
        {/* Contenido: filas de día + horarios */}
        {selectedDoctorId && (
          <>
            {loadingData ? (
              <div className="p-6 text-center text-sm text-med-text-muted">
                Cargando disponibilidad actual...
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 mb-4">
                  {rows.map((row, index) => (
                    <div
                      key={index}
                      className="flex items-end gap-2 p-3 bg-gray-50 border border-med-border-subtle rounded-xl"
                    >
                      {/* Día */}
                      <div className="flex flex-col gap-1 flex-1">
                        {index === 0 && (
                          <label className="text-[10px] font-semibold text-med-text-sub uppercase">
                            Día
                          </label>
                        )}
                        <select
                          value={row.day}
                          onChange={(e) =>
                            updateRow(index, 'day', e.target.value)
                          }
                          className="w-full px-2 py-2 text-xs bg-white border border-med-border rounded-lg focus:outline-none focus:ring-1 focus:ring-med-primary-600"
                        >
                          <option value="">Día...</option>
                          {DAYS_OPTIONS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                      {/* Hora inicio */}
                      <div className="flex flex-col gap-1">
                        {index === 0 && (
                          <label className="text-[10px] font-semibold text-med-text-sub uppercase">
                            Desde
                          </label>
                        )}
                        <input
                          type="time"
                          value={row.startTime}
                          onChange={(e) =>
                            updateRow(index, 'startTime', e.target.value)
                          }
                          className="px-2 py-2 text-xs bg-white border border-med-border rounded-lg focus:outline-none focus:ring-1 focus:ring-med-primary-600"
                        />
                      </div>
                      {/* Hora fin */}
                      <div className="flex flex-col gap-1">
                        {index === 0 && (
                          <label className="text-[10px] font-semibold text-med-text-sub uppercase">
                            Hasta
                          </label>
                        )}
                        <input
                          type="time"
                          value={row.endTime}
                          onChange={(e) =>
                            updateRow(index, 'endTime', e.target.value)
                          }
                          className="px-2 py-2 text-xs bg-white border border-med-border rounded-lg focus:outline-none focus:ring-1 focus:ring-med-primary-600"
                        />
                      </div>
                      {/* Botón quitar fila */}
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        disabled={rows.length <= 1}
                        className="p-2 rounded-lg text-med-text-muted hover:text-red-600 hover:bg-red-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Quitar este día"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                {/* Botón agregar día */}
                <button
                  type="button"
                  onClick={addRow}
                  className="w-full py-2 mb-5 border-2 border-dashed border-med-border rounded-xl text-xs font-semibold text-med-primary-700 hover:bg-med-primary-50 transition"
                >
                  + Agregar otro día
                </button>
              </>
            )}
          </>
        )}
        {/* Botones de acción */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            className="w-full text-xs py-2.5"
            onClick={onClose}
          >
            Cerrar
          </Button>
          {selectedDoctorId && (
            <Button
              type="button"
              className="w-full text-xs py-2.5 bg-med-primary-900 hover:bg-med-primary-800 text-white"
              onClick={handleSubmit}
              disabled={loading || loadingData}
            >
              {loading
                ? 'Guardando...'
                : hasExisting
                  ? 'Actualizar Disponibilidad'
                  : 'Crear Disponibilidad'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
export default AvailabilityModal;
 