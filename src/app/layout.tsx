import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster-simple";
import { AuthProvider } from '@/hooks/use-auth';
import { SidebarProvider } from '@/contexts/sidebar-context';
import { Suspense } from 'react';
import { PageLoading } from '@/components/ui/page-loading';
import { ErrorSuppressor } from '@/components/error-suppressor';
import { ErrorBoundary } from '@/components/error-boundary';
import { NotificationProvider, NotificationContainer } from '@/lib/notification-system';
import { errorTracker } from '@/lib/client-error-tracker';

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
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
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
  // Initialize error tracking on app load
  if (typeof window !== 'undefined') {
    // Error tracking is initialized automatically via import
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Suspense fallback={<PageLoading message="Initializing application..." />}>
          <ErrorBoundary context="root_layout" showDetails={process.env.NODE_ENV === 'development'}>
            <NotificationProvider>
              <AuthProvider>
                <SidebarProvider>
                  {children}
                  <Toaster />
                  <NotificationContainer />
                </SidebarProvider>
              </AuthProvider>
            </NotificationProvider>
          </ErrorBoundary>
        </Suspense>
      </body>
    </html>
  );
}