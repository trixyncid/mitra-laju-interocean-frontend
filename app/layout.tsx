import type { Metadata } from "next";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Dashboard - Mitra Laju Interocean",
  description: "Freight forwarding operations dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${ibmPlexSans.variable} ${spaceGrotesk.variable} font-sans antialiased`}
          suppressHydrationWarning
        >
          <Providers>
            {children}
            <Toaster position="top-center" />
          </Providers>
        </body>
      </html>
  );
}
