import { forwardRef } from "react";

export const Select = forwardRef(function Select(
  {
    label,
    error,
    children,
    className = "",
    id,
    ...props
  },
  ref
) {
  const selectId = id || props.name || props.id || "select";

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-zinc-300"
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`rounded-md border bg-[#1f2937] px-3 py-2 text-sm text-white ${
          error
            ? "border-red-500 focus:border-red-400 focus:ring-red-400/50"
            : "border-zinc-700 focus:border-amber-400 focus:ring-amber-400/50"
        } outline-none transition-colors`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <span className="text-xs text-red-300">{error}</span>
      )}
    </div>
  );
});

export default Select;
