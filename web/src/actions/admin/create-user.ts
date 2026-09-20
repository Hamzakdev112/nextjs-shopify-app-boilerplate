"use server";

import { revalidatePath } from "next/cache";
import {
  actionFail,
  actionFailFromError,
  actionOk,
  type ActionResponse,
} from "@/lib/core/action-response";
import { requireAdminUser } from "@/lib/core/auth-context";
import { createUser } from "@/lib/admin/users";

export async function createStaffUser(input: {
  email: string;
  name: string;
  password: string;
}): Promise<ActionResponse> {
  try {
    await requireAdminUser();
    if (!input.name.trim() || !input.email.trim() || input.password.length < 8) {
      return actionFail(
        "VALIDATION",
        "Name, email, and a password of at least 8 characters are required",
      );
    }
    await createUser(input);
    revalidatePath("/admin/users");
    return actionOk();
  } catch (error) {
    return actionFailFromError(error);
  }
}
