import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shopify App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const apiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY ?? "";

  return (
    <html lang="en">
      <head>
        <meta name="shopify-api-key" content={apiKey} />
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
