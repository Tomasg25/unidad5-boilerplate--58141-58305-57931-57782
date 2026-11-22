const VARIANTS = {
  active: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
  booked: {
    bg: 'bg-med-active-bg',
    text: 'text-med-active-text',
    dot: 'bg-med-active-text',
  },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  attended: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500' },
  noshow: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
};

function StatusBadge({ label, variant = 'active' }) {
  const styles = VARIANTS[variant] || VARIANTS.active;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${styles.bg} ${styles.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      {label}
    </span>
  );
}
export default StatusBadge;
