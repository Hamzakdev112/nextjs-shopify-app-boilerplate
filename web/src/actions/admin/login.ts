"use server";

import {
  actionFail,
  actionOk,
  type ActionResponse,
} from "@/lib/core/action-response";
import { setStaffSession } from "@/lib/admin/staff-session";
import { authenticateStaff } from "@/lib/admin/users";

export async function loginStaff(
  email: string,
  password: string,
): Promise<ActionResponse> {
  const user = await authenticateStaff(email, password);
  if (!user) {
    return actionFail("UNAUTHORIZED", "Invalid email or password");
  }

  await setStaffSession(user.id);
  return actionOk();
}
