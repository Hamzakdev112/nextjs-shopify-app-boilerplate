import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff admin",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
