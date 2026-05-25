import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FreelancerOS — Close Freelance Clients Faster",
  description:
    "AI-powered proposals, smart client replies, and project estimates — the complete workflow system for freelance developers and agencies.",
  keywords: [
    "freelancer proposal generator",
    "upwork proposal AI",
    "freelancer CRM",
    "AI proposal writer",
    "freelancer tools",
    "client reply assistant",
  ],
  openGraph: {
    title: "FreelancerOS — Close Freelance Clients Faster",
    description:
      "AI-powered proposals, smart client replies, and project estimates. Built for freelance developers.",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "FreelancerOS — Close Freelance Clients Faster",
    description: "AI workflow for freelancers who want to win more clients.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#030712",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gray-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
