import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/use-auth';
import { SidebarProvider } from '@/contexts/sidebar-context';
import { GlobalLayout } from '@/components/global-layout';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OBE Portal - Outcome-Based Education Management",
  description: "NBA compliant Outcome-Based Education portal for universities",
  keywords: ["OBE", "NBA", "Education", "University", "Outcome-Based"],
  authors: [{ name: "OBE Portal Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "OBE Portal",
    description: "NBA compliant Outcome-Based Education portal",
    url: "https://obe-portal.com",
    siteName: "OBE Portal",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OBE Portal",
    description: "NBA compliant Outcome-Based Education portal",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <SidebarProvider>
            {children}
            <Toaster />
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
