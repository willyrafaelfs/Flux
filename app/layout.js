import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "Flux — Platform Manajemen Keuangan & Arsip Struk Cerdas",
  description: "Kelola alur kas, pantau anggaran, dan arsip bukti transaksi secara otomatis dengan Google Gemini AI dan integrasi Google Drive pribadi.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} font-sans`}>
      <body className="bg-[#F8FAFC] text-[#111827] antialiased selection:bg-emerald-100 selection:text-emerald-900">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
