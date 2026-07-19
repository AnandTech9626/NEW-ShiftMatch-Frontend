import { z } from "zod";

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Full name must be at least 2 characters"),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),

  mobileNumber: z
    .string()
    .min(1, "Mobile number is required")
    .regex(
      /^(0\d{9}|\+27\d{9}|\d{9})$/,
      "Enter a valid SA mobile number (e.g. 0712345678 or +27712345678)"
    ),

  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});
