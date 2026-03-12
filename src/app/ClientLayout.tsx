"use client";

import { Suspense, useState, useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import { usePathname } from "next/navigation";
import { Analytics } from '@vercel/analytics/next'; 
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

  // 1. Explicitly list only the pages where the button SHOULD appear
  const allowedRoutes = [
    "/",
    "/productlisting",
    "/productinfo",
    "/checkout",
    "/userprofile",
    "/searchresults",
    "/designers",
    "/designerinfo",
    "/cart"
  ];

  // 2. Exact matching logic to prevent showing on sub-pages like /sellersignup
  const showWorkerButton = allowedRoutes.some(route => {
    if (route === "/") {
      return pathname === "/"; // Only show on exact home page
    }
    // For internal pages, ensure we match the base route correctly
    return pathname === route || pathname.startsWith(`${route}/`) || pathname.startsWith(`${route}?`);
  });

  const shouldDisableScroll = pathname === "/" && isDesktop;

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased ${shouldDisableScroll ? "no-scroll" : ""}`}>
      <NextAuthProvider>
        {/* 3. Button will now be hidden on /sellersignup and other non-allowed pages */}
        {showWorkerButton && <WorkerServiceButton />}
        
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </NextAuthProvider>
      <Analytics />
    </div>
  );
}