import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenDental CUA",
  description: "Computer User Agent for OpenDental Automation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
