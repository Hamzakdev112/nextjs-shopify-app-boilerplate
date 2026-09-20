import { AppNav } from "@/components/app-nav";
import { AppShell } from "@/components/app-shell";
import { SessionProvider } from "@/components/session-provider";

export default function EmbeddedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AppNav />
      <AppShell>{children}</AppShell>
    </SessionProvider>
  );
}
