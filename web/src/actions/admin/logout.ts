"use server";

import { redirect } from "next/navigation";
import { clearStaffSession } from "@/lib/admin/staff-session";

export async function logoutStaff() {
  await clearStaffSession();
  redirect("/admin/login");
}
