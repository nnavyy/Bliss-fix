import "../styles/globals.css";

export const metadata = {
  title: "MediKidney — Kidney Stone Detection",
  description:
    "AI-powered kidney stone detection system for medical professionals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
