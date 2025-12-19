import "../styles/globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Bliss Fix",
  description: "Sistem Deteksi Batu Ginjal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
