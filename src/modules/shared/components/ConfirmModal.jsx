import Button from './Button';
function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    children,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    loading = false,
    variant = 'danger',
}) {
    if (!isOpen) return null;
    const iconByVariant = {
        danger: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        ),
        warning: (
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86l-8.4 14.31A1 1 0 002.77 20h18.46a1 1 0 00.88-1.83l-8.4-14.31a1 1 0 00-1.76 0z" />
            </svg>
        ),
    };
    const iconBgByVariant = {
        danger: 'bg-red-100 text-red-600',
        warning: 'bg-amber-100 text-amber-600',
    };
    const confirmBgByVariant = {
        danger: 'bg-red-600 hover:bg-red-700',
        warning: 'bg-amber-600 hover:bg-amber-700',
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${iconBgByVariant[variant]}`}>
                    {iconByVariant[variant]}
                </div>
                <h3 className="text-lg font-bold text-med-primary-900">{title}</h3>
                <div className="text-xs text-med-text-sub mt-2 leading-relaxed">{children}</div>
                <div className="flex gap-3 mt-5">
                    <Button
                        variant="secondary"
                        className="w-full text-xs py-2.5"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        className={`w-full text-xs py-2.5 text-white ${confirmBgByVariant[variant]}`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Procesando...' : confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}
export default ConfirmModal;