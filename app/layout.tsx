import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "오늘이 메뉴 | 오늘 점심, 뭐 먹지?",
  description: "바쁜 직장인을 위한 점심 메뉴 추천 서비스.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
