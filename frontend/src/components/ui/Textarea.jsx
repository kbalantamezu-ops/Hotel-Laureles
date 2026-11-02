import { forwardRef } from "react";

export const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    className = "",
    id,
    rows = 3,
    ...props
  },
  ref
) {
  const textareaId = id || props.name || props.id || props.placeholder || "textarea";

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className="text-sm font-medium text-zinc-300"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`rounded-md border bg-[#1f2937] px-3 py-2 text-sm text-white placeholder-zinc-500 resize-y ${
          error
            ? "border-red-500 focus:border-red-400 focus:ring-red-400/50"
            : "border-zinc-700 focus:border-amber-400 focus:ring-amber-400/50"
        } outline-none transition-colors`}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-300">{error}</span>
      )}
    </div>
  );
});

export default Textarea;
