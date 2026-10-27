import { describe, it, expect } from "vitest";
import { RegisterInputSchema, LoginInputSchema } from "@/lib/validations/auth";

describe("User Registration & Login Validation", () => {
  it("accepts a valid registration payload", () => {
    const valid = {
      name: "Juan Pérez",
      email: "juan@example.pe",
      password: "Password123!",
    };
    const result = RegisterInputSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects password shorter than 8 characters", () => {
    const invalid = {
      name: "Juan Pérez",
      email: "juan@example.pe",
      password: "Pass1",
    };
    const result = RegisterInputSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects password without uppercase letter", () => {
    const invalid = {
      name: "Juan Pérez",
      email: "juan@example.pe",
      password: "password123",
    };
    const result = RegisterInputSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects password without number", () => {
    const invalid = {
      name: "Juan Pérez",
      email: "juan@example.pe",
      password: "PasswordNoNumber",
    };
    const result = RegisterInputSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("normalizes and accepts valid email", () => {
    const valid = {
      email: "  USER@Example.COM  ",
      password: "Secret123Password",
      name: "Ana Gomez",
    };
    const result = RegisterInputSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });

  it("rejects invalid login format", () => {
    const result = LoginInputSchema.safeParse({ email: "invalid-email", password: "" });
    expect(result.success).toBe(false);
  });
});
