import "@repo/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { AuthProvider } from "../components/auth-provider";

export const metadata: Metadata = {
  title: "Job Hunter | Your application workspace",
  description:
    "Capture, score, and move the job opportunities worth your attention.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
