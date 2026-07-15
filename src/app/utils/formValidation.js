import { z } from "zod";

export const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(value) {
  return inrFormatter.format(Number(value) || 0);
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
  phone: phoneSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = authSchema.extend({
  fullName: cleanText,
});

export const profileDetailsSchema = z.object({
  name: cleanText,
  role: cleanText,
  location: cleanText,
  bio: cleanLongText,
});

export const activitySchema = z.object({
  id: z.number(),
  client: cleanText,
  initials: z.string().trim().min(1, "Initials are required").max(3, "Use 1-3 letters"),
  title: cleanText,
  budget: positiveCurrencySchema,
  description: cleanLongText,
  tags: z.array(cleanText).min(1, "Add at least one tag"),
  status: cleanText,
  date: cleanText,
});

export const portfolioSchema = z.object({
  id: z.number(),
  title: cleanText,
  budget: positiveCurrencySchema,
  summary: cleanLongText,
  tags: z.array(cleanText).min(1, "Add at least one tag"),
});

export const skillsSchema = z.array(cleanText).min(1, "Add at least one skill");

export const postJobSchema = z.object({
  title: cleanText,
  category: cleanText,
  tier: cleanText,
  brief: cleanLongText,
  skills: cleanLongText,
  deadline: z.string().min(1, "Deadline is required"),
  budget: positiveCurrencySchema,
});
