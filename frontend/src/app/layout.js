import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "../components/auth/AuthProvider";
import AppShell from "../components/layout/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Hotel Los Laureles | Sistema de Gestión",
  description:
    "Panel de gestión del hotel construido con Next.js y Tailwind CSS.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#0b1120] text-zinc-100">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
