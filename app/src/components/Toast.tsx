export type ToastType = 'success' | 'error' | 'warning';

export interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

export default function Toast({ toast }: { toast: ToastState }) {
  const iconClass =
    toast.type === 'error'
      ? 'fa-solid fa-circle-xmark text-rose-400'
      : toast.type === 'warning'
        ? 'fa-solid fa-triangle-exclamation text-amber-400'
        : 'fa-solid fa-circle-check text-emerald-400';

  return (
    <div
      id="toast"
      className={`${toast.visible ? '' : 'hidden'} no-print fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 text-sm transition-all transform duration-200`}
    >
      <i className={iconClass}></i>
      <span>{toast.message}</span>
    </div>
  );
}
