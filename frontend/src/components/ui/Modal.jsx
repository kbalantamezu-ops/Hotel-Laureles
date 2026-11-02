"use client";

import { useEffect, useRef } from "react";
import Button from "./Button";

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-zinc-900/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`relative z-10 w-full max-h-[90vh] overflow-auto rounded-lg border border-zinc-700 bg-[#161b29] p-5 shadow-xl ${
          size === "sm"
            ? "max-w-sm mx-4"
            : size === "lg"
            ? "max-w-2xl mx-4"
            : "max-w-lg mx-4"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-white"
            >
              {title}
            </h2>
            <button
              type="button"
              className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              onClick={onClose}
              aria-label="Cerrar"
            >
              <svg
                className="h-5 w-5"
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
          </div>
        )}

        <div className="text-sm text-zinc-300">{children}</div>

        {footer && (
          <div className="mt-5 flex items-center justify-end gap-3 border-t border-zinc-800 pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Hook auxiliar para obtener las acciones típicas de un modal de eliminación.
export function useDeleteModal({
  open,
  onOpenChange,
  onConfirm,
  loading,
  title = "Confirmar eliminación",
  message = "¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer.",
}) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return {
    open,
    onOpenChange,
    title,
    message,
    footer: (
      <>
        <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button
          variant="danger"
          loading={loading}
          onClick={handleConfirm}
        >
          Eliminar
        </Button>
      </>
    ),
  };
}
