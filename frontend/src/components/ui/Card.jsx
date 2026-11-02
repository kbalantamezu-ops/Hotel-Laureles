export default function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`rounded-lg border border-zinc-800 bg-[#111827] p-5 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
