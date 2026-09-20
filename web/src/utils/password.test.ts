import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/utils/password";

describe("password", () => {
  it("accepts the original password and rejects another", async () => {
    const stored = await hashPassword("correct-horse");
    expect(await verifyPassword("correct-horse", stored)).toBe(true);
    expect(await verifyPassword("wrong-battery", stored)).toBe(false);
  });
});
