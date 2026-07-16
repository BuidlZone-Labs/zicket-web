import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Work_Sans } from "next/font/google";
import localFont from "next/font/local";
import "../globals.css";
import { ThemeProvider } from "@/app/context/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

const satoshi = localFont({
  src: "../../fonts/Satoshi-Variable.ttf",
  variable: "--font-satoshi",
});

export const metadata: Metadata = {
  title: "Authentication - Zicket",
  description: "Authentication pages for Zicket Organizers, including login and registration.",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${satoshi.variable} ${workSans.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
