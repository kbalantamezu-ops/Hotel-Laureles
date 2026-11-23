export default function PageLoader({ label = "Cargando..." }) {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4">
      <svg
        className="h-8 w-8 animate-spin text-amber-400"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
        />
      </svg>
      <p className="text-sm text-zinc-400">{label}</p>
    </div>
  );
}
