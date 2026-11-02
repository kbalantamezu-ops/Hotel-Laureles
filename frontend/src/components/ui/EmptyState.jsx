export default function EmptyState({ message, action }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center text-zinc-400">
      <div className="rounded-full border border-zinc-700 bg-zinc-900/60 p-4">
        <svg
          className="h-8 w-8 text-zinc-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
          <path d="M13 2v7h7" />
          <path d="M12 18v-6" />
          <path d="M9 15h6" />
        </svg>
      </div>
      <div className="max-w-sm">
        <div className="text-base font-medium text-white">{message || "No hay registros."}</div>
        <div className="mt-1 text-sm text-zinc-500">
          No se encontraron elementos para mostrar en esta sección.
        </div>
      </div>
      {action && action}
    </div>
  );
}
