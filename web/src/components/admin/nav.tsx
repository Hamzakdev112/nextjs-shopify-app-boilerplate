"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutStaff } from "@/actions/admin/logout";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/stores", label: "Stores" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/jobs", label: "Jobs" },
  { href: "/admin/account", label: "Account" },
];

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="admin-nav">
      <p className="admin-brand">Staff admin</p>
      <nav>
        {links.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          return (
            <Link key={link.href} href={link.href} className={active ? "active" : undefined}>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <form action={logoutStaff} className="admin-nav-foot">
        <p className="muted">{email}</p>
        <button type="submit" className="btn-text">
          Log out
        </button>
      </form>
    </aside>
  );
}
