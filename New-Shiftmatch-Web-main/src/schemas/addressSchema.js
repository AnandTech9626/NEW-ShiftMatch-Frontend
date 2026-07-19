import { z } from "zod";

export const addressSchema = z.object({
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  area: z.string().min(1, "Street Address Line 1 is required"),
  street: z.string().min(1, "Street Address Line 2 is required"),
  pincode: z.string().min(1, "Zip Code is required").regex(/^[0-9]+$/, "Zip Code must be numeric").min(4, "Zip code too short"),
  country: z.string().min(1, "Country is required"),
});
