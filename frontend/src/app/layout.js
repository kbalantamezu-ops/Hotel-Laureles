import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppLayout from "../components/layout/AppLayout";
import { Metadata } from "next";

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
      <body className="min-h-full bg-[#0b1120] text-zinc-100 flex flex-col">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
