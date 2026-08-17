import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { AuthShell } from "@/components/layout/AuthShell";
import { AffiliateCapture } from "@/components/AffiliateCapture";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"),
  title: "Zaam Wholesale | B2B E-Commerce & Retail Portal",
  description: "Official Zaam Group B2B wholesale platform for drinks, energy beverages, confectionery, snacks, and FMCG trade supply.",
  icons: {
    icon: [{ url: "/brand/golden.png", type: "image/png" }],
    shortcut: [{ url: "/brand/golden.png", type: "image/png" }],
    apple: [{ url: "/brand/golden.png", type: "image/png" }]
  },
  openGraph: {
    title: "Zaam Wholesale | B2B E-Commerce & Retail Portal",
    description: "Official Zaam Group B2B wholesale platform for FMCG trade supply.",
    images: ["/brand/golden.png"]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 min-h-screen text-slate-900 flex flex-col selection:bg-zaam-green-600 selection:text-white">
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <AffiliateCapture />
              <AuthShell>{children}</AuthShell>
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
