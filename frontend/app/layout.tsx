import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "SlovoKrok — словацкий язык A1",
  description: "SlovoKrok — интерактивный курс словацкого языка уровня A1",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var key="ai-learning-platform-theme";var saved=localStorage.getItem(key);var theme=saved==="dark"||saved==="light"?saved:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=theme;}catch(_){}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
