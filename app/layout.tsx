import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import toast, { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Draw anything",
  description:
    "Draw and get realistic outputs to different objects generated by our model and get different recommendations based on current inputs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="overflow-y-hidden">
      <body className={inter.className}>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
