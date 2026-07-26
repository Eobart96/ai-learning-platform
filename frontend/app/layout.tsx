import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "AI Learning Platform",
  description: "Учебная платформа словацкого языка A1",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
