"use server";

import { revalidatePath } from "next/cache";
import {
  actionFailFromError,
  actionOk,
  type ActionResponse,
} from "@/lib/core/action-response";
import { requireAdminUser } from "@/lib/core/auth-context";
import { retryFailedJob } from "@/lib/admin/jobs";

export async function retryStaffJob(
  queueName: string,
  jobId: string,
): Promise<ActionResponse> {
  try {
    await requireAdminUser();
    await retryFailedJob(queueName, jobId);
    revalidatePath("/admin/jobs");
    return actionOk();
  } catch (error) {
    return actionFailFromError(error);
  }
}
