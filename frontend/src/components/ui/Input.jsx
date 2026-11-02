import { forwardRef } from "react";

export const Input = forwardRef(function Input(
  {
    label,
    error,
    className = "",
    id,
    ...props
  },
  ref
) {
  const inputId = id || props.name || props.id || props.placeholder || "input";

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-zinc-300"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`rounded-md border bg-[#1f2937] px-3 py-2 text-sm text-white placeholder-zinc-500 ${
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

export default Input;
