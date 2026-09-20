import { optionalEnv } from "@/lib/env";

export const config = {
  workerMode: optionalEnv("WORKER_MODE", "false") === "true",
};
