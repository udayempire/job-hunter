import "@repo/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "../components/auth-provider";
import { QueryProvider } from "../components/query-provider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://jobhunti.space",
  ),
  title: {
    default: "Job Hunti | Organize your job search",
    template: "%s | Job Hunti",
  },
  description:
    "Save opportunities, keep job and recruiter details together, and track every application in one focused workspace.",
  applicationName: "Job Hunti",
  keywords: [
    "job search tracker",
    "job application tracker",
    "job hunt organizer",
    "application workspace",
    "career planning",
  ],
  authors: [{ name: "Job Hunti" }],
  creator: "Job Hunti",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Job Hunti",
    title: "Job Hunti | Organize your job search",
    description:
      "Save opportunities, keep job and recruiter details together, and track every application in one focused workspace.",
    images: [
      {
        url: "/jobhunti-logo.png",
        width: 1600,
        height: 1600,
        alt: "Job Hunti logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Job Hunti | Organize your job search",
    description:
      "Save opportunities, keep job and recruiter details together, and track every application in one focused workspace.",
    images: ["/jobhunti-logo.png"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/jobhunti-logo.png",
    shortcut: "/jobhunti-logo.png",
    apple: "/jobhunti-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${inter.variable}`}>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
