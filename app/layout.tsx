import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/components/providers/NextAuthProvider";
import SocketProvider from "@/components/providers/SocketProvider";
import NotificationProvider from "@/components/providers/NotificationProvider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "동탄국제고 자습실 관리 시스템",
  description: "학생 자습실 좌석 배치 및 퍼미션 관리 시스템",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script src="https://unpkg.com/html5-qrcode" type="text/javascript"></script>
        <NextAuthProvider>
          <SocketProvider>
            <NotificationProvider>
              {children}
              <Toaster position="top-right" />
            </NotificationProvider>
          </SocketProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
