/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración mínima para este proyecto.
  // Tailwind v4 se usa vía CSS (@import "tailwindcss") en globals.css.
  experimental: {
    // Marca el canal de actualización usado para resolver el aviso de
    // seguridad de Next.js 16.4.0 → 16.4.6.
    agentUpgrade: "security",
  },
};

export default nextConfig;
