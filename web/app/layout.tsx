import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SnapShop - Turn your pamphlet into an online store",
  description: "Upload your shop pamphlet and let SnapShop extract your products, prices and business information automatically.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
