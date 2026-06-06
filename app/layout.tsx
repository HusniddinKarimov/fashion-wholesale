import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const geist = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FashionWholesale Corp — B2B Portal",
  description: "Premium wholesale clothing for buyers worldwide",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${geist.variable}`}>
      <body className="bg-[#fafaf9] text-[#1a1a2e] font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
