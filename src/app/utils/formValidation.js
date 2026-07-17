import { z } from "zod";

export const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(value) {
  return inrFormatter.format(Number(value) || 0);
}

// Real profiles have no stored avatar initials (unlike the old mock `av`
// field) — derived client-side from the display name wherever an avatar
// image isn't set.
export function getInitials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";
}

export const cleanText = z
  .string()
  .trim()
  .min(2, "Must be at least 2 characters");

export const cleanLongText = z
  .string()
  .trim()
  .min(2, "Must be at least 2 characters");

export const phoneSchema = z
  .string()
  .regex(/^\d{10}$/, "Enter exactly 10 numeric digits");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Enter a valid email address");

export const positiveCurrencySchema = z.coerce
  .number()
  .finite("Enter a valid amount")
  .min(0, "Amount cannot be negative");

export const integerSchema = z.coerce
  .number()
  .int("Enter a whole number")
  .min(0, "Value cannot be negative");

export const authSchema = z.object({
  fullName: z.string().optional(),
  email: emailSchema,
  // Phone remains required for account creation, but is optional on sign-in
  // so internally provisioned admins (whose phone can be null) can use the
  // same shared authentication form as every other account.
  phone: z.union([phoneSchema, z.literal("")]).optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = authSchema.extend({
  fullName: cleanText,
  phone: phoneSchema,
});

export const adminAuthSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const postJobSchema = z.object({
  title: cleanText,
  category: cleanText,
  tier: cleanText,
  brief: cleanLongText,
  skills: cleanLongText,
  deadline: z.string().min(1, "Deadline is required"),
  budget: positiveCurrencySchema,
});
