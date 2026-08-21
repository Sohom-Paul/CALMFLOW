import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CalmFlow",
  description: "A calm, personalized mindfulness companion."
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
