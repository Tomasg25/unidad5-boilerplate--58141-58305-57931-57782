import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../shared/components/Button';
import useAuth from '../../auth/hook/useAuth';
import { frontendErrorMessage } from '../../auth/helpers/backendError';

function PatientLoginPage() {
  const [errorMessage, setErrorMessage] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: '', dni: '' } }); //Antes tenia password

  const navigate = useNavigate();
  const { singinPatient } = useAuth();

  const onValid = async (formData) => {
    console.log('Form Data:', formData); // Log the form data for debugging
    try {
      const { error } = await singinPatient(
        formData.email,
        Number(formData.dni)
      );

      if (error) {
        setErrorMessage(error.frontendErrorMessage || 'Credenciales inválidas');
        return;
      }

      navigate('/');
    } catch (error) {
      if (error?.response?.data?.code) {
        setErrorMessage(frontendErrorMessage[error?.response?.data?.code]);
      } else {
        setErrorMessage('Error al conectar con el servicio de pacientes');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-med-primary-950 px-4 py-8 sm:p-6">
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-3">
          <svg
            className="w-8 h-8 text-med-primary-900"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          MedPortal
        </h1>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-white/10 p-6 sm:p-10">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-med-primary-900">
            Portal del Paciente
          </h2>
          <p className="text-xs text-med-text-sub mt-1 leading-relaxed">
            Inicia sesión para reservar y consultar tus turnos médicos
          </p>
        </div>

        <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-4">
          {/* Correo Electrónico */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-med-text-main">
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-med-text-muted">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                type="email"
                placeholder="paciente@ejemplo.com"
                className={`w-full border rounded-lg pl-10 pr-3.5 py-2.5 text-sm bg-white text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-2 focus:ring-med-primary-600 focus:border-transparent ${errors.email ? 'border-red-400 bg-red-50/20' : 'border-med-border'
                  }`}
                {...register('email', {
                  required: 'El correo electrónico es obligatorio',
                })}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* DNI */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-med-text-main">
              DNI
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-med-text-muted">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
                  <path d="M6 14h2" />
                </svg>
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="12345678"
                className={`w-full border rounded-lg pl-10 pr-3.5 py-2.5 text-sm bg-white text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-2 focus:ring-med-primary-600 focus:border-transparent ${errors.dni ? 'border-red-400 bg-red-50/20' : 'border-med-border'
                  }`}
                {...register('dni', {
                  required: 'El DNI es obligatorio',
                })}
              />
            </div>
            {errors.dni && (
              <p className="text-xs text-red-500 font-medium">{errors.dni.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full mt-1">
            Ingresar Paciente
          </Button>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 text-center">
              {errorMessage}
            </div>
          )}
        </form>
      </div>

      <div className="mt-6 text-center">
        <Link
          to="/admin/login"
          className="text-xs text-med-primary-200 hover:text-white transition"
        >
          ¿Es personal administrativo o médico? Ingrese aquí →
        </Link>
      </div>
    </div>
  );
}

export default PatientLoginPage;