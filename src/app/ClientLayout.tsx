// src/app/ClientLayout.tsx
"use client";

import { Suspense, useState, useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import { usePathname } from "next/navigation";
import { Analytics } from '@vercel/analytics/next'; 
// 1. Import your new global button
import WorkerServiceButton from "@/components/customer/WorkerServiceButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const shouldDisableScroll = pathname === "/" && isDesktop;

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased ${shouldDisableScroll ? "no-scroll" : ""}`}>
      <NextAuthProvider>
        {/* 2. Place the button here so it appears on every page */}
        <WorkerServiceButton />
        
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </NextAuthProvider>
      <Analytics />
    </div>
  );
}