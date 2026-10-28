import { describe, it, expect } from "vitest";
import { CategoryInputSchema } from "../../src/lib/validations/category";

describe("CategoryInputSchema Validation", () => {
  it("validates valid expense category input", () => {
    const validData = {
      name: "Alimentación",
      type: "EXPENSE",
      icon: "Utensils",
      color: "#F97316",
    };
    const result = CategoryInputSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("validates valid income category input", () => {
    const validData = {
      name: "Sueldo",
      type: "INCOME",
      icon: "Briefcase",
      color: "#10B981",
    };
    const result = CategoryInputSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 2 characters", () => {
    const invalidData = {
      name: "A",
      type: "EXPENSE",
    };
    const result = CategoryInputSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("al menos 2 caracteres");
    }
  });

  it("rejects invalid hex color code", () => {
    const invalidColor = {
      name: "Educación",
      type: "EXPENSE",
      color: "rojo-invalido",
    };
    const result = CategoryInputSchema.safeParse(invalidColor);
    expect(result.success).toBe(false);
  });

  it("assigns default icon and color when not provided", () => {
    const dataWithoutOptionals = {
      name: "Mascotas",
      type: "EXPENSE",
    };
    const result = CategoryInputSchema.safeParse(dataWithoutOptionals);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.icon).toBe("Tag");
      expect(result.data.color).toBe("#64748B");
    }
  });
});
