import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Payload Static",
  description: "Basic Payload CMS static site example",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
