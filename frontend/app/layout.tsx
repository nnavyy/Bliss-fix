import "@/styles/globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MediKidney - Kidney Stone Detection",
  description:
    "AI-powered kidney stone detection system for medical professionals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased text-gray-900 bg-gray-50">{children}</body>
    </html>
  );
}
