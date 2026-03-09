import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TradeRush | Momentum Signal Terminal",
  description: "News-driven momentum trading signals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth selection:bg-brand-orange selection:text-white">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Unbounded:wght@500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#050505] text-gray-100 font-sans antialiased" style={{ fontFamily: "'Inter', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
