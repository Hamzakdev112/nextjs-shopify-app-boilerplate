"use server";

import {
  actionFail,
  actionFailFromError,
  actionOk,
  type ActionResponse,
} from "@/lib/core/action-response";
import { requireAdminUser } from "@/lib/core/auth-context";
import { updateUserPassword } from "@/lib/admin/users";

export async function updateOwnPassword(password: string): Promise<ActionResponse> {
  try {
    const user = await requireAdminUser();
    if (password.length < 8) {
      return actionFail("VALIDATION", "Password must be at least 8 characters");
    }
    await updateUserPassword(user.id, password);
    return actionOk();
  } catch (error) {
    return actionFailFromError(error);
  }
}
