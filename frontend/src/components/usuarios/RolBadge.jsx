import { ROLE_BADGE_CLASSES } from "@/lib/roles";

export default function RolBadge({ rol, className = "" }) {
  const clases =
    ROLE_BADGE_CLASSES[rol] ||
    "bg-zinc-800 text-zinc-300 border-zinc-700";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${clases} ${className}`}
    >
      {rol || "Sin rol"}
    </span>
  );
}
