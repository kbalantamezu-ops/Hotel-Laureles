export default function SkeletonCard({ width = "100%", height = 20, className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-zinc-800 ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
