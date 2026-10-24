import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cron",
  description:
    "My personal console for scheduling jobs and keeping things running on time.",
  openGraph: {
    title: "Cron",
    description:
      "My personal console for scheduling jobs and keeping things running on time.",
    siteName: "Cron",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cron",
    description:
      "My personal console for scheduling jobs and keeping things running on time.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.variable} h-full font-sans antialiased`}>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
