import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blue AI — Complete Your Subscription",
  description: "Subscribe to Blue AI and unlock AI Chat, Code Autocomplete, Codebase Search, and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔷</text></svg>" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
