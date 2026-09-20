export type ActionErrorCode =
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "VALIDATION"
  | "EXTERNAL"
  | "INTERNAL";

export type ActionSuccess<T> = {
  success: true;
  payload: T;
};

export type ActionFailure = {
  success: false;
  error: string;
  code: ActionErrorCode;
};

export type ActionResponse<T = void> = ActionSuccess<T> | ActionFailure;

export function actionOk(): ActionResponse<void>;
export function actionOk<T>(payload: T): ActionResponse<T>;
export function actionOk<T>(payload?: T): ActionResponse<T> {
  return { success: true, payload: payload as T };
}

export function toErrorMessage(error: unknown): string {
  if (error == null) return "Unknown error";
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error) ?? "Unknown error";
  } catch {
    return "Unknown error";
  }
}

export function actionFail(code: ActionErrorCode, error: unknown): ActionFailure {
  return { success: false, error: toErrorMessage(error), code };
}

export function actionFailFromError(error: unknown): ActionFailure {
  const code = (error as { actionErrorCode?: ActionErrorCode } | null)?.actionErrorCode;
  return actionFail(code ?? "INTERNAL", error);
}
