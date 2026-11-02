import { useState, useEffect } from "react";

const variantClasses = {
  success:
    "bg-emerald-500/10 border-emerald-500/25 text-emerald-300",
  error:
    "bg-red-500/10 border-red-500/25 text-red-300",
  warning:
    "bg-amber-500/10 border-amber-500/25 text-amber-300",
  info:
    "bg-sky-500/10 border-sky-500/25 text-sky-300",
};

const icons = {
  success: (
    <svg className="h-5 w-5 shrink-0 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5 shrink-0 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5 shrink-0 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5 shrink-0 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  ),
};

export default function Alert({
  variant = "info",
  children,
  onDismiss,
  showDismiss = false,
  className = "",
}) {
  const classes = `${variantClasses[variant]} rounded-md border px-4 py-3 flex items-start gap-3 ${className}`;

  return (
    <div role="alert" className={classes}>
      {icons[variant]}
      <div className="flex-1 text-sm leading-relaxed">{children}</div>
      {showDismiss && (
        <button
          type="button"
          className="shrink-0 rounded-md p-1 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          onClick={onDismiss}
          aria-label="Cerrar"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * Alert que desaparece automáticamente tras un tiempo.
 */
export function DismissingAlert({
  variant = "info",
  children,
  duration = 4000,
  onDismiss,
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, visible]);

  if (!visible) return null;

  return (
    <Alert
      variant={variant}
      onDismiss={() => setVisible(false)}
      showDismiss
    >
      {children}
    </Alert>
  );
}
