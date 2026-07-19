import { z } from "zod";

export const departmentSchema = z.object({
  departmentName: z
    .string()
    .min(1, "Department name is required")
    .min(2, "Department name must be at least 2 characters")
    .regex(/^[a-zA-Z\s]+$/, "Only alphabets and spaces are allowed"),
});

export const designationSchema = z.object({
  designationName: z
    .string()
    .min(1, "Designation name is required")
    .min(2, "Designation name must be at least 2 characters")
    .regex(/^[a-zA-Z\s]+$/, "Only alphabets and spaces are allowed"),
});

export const documentTypeSchema = z.object({
  documentName: z
    .string()
    .min(1, "Document type name is required")
    .min(2, "Document type name must be at least 2 characters")
    .regex(/^[a-zA-Z\s]+$/, "Only alphabets and spaces are allowed"),
});

export const locationStateSchema = z.object({
  stateName: z
    .string()
    .min(1, "State name is required")
    .min(2, "State name must be at least 2 characters")
    .regex(/^[a-zA-Z\s]+$/, "Only alphabets and spaces are allowed"),
});

export const locationCitySchema = z.object({
  cityName: z
    .string()
    .min(1, "City name is required")
    .min(2, "City name must be at least 2 characters")
    .regex(/^[a-zA-Z\s]+$/, "Only alphabets and spaces are allowed"),

  stateId: z.string().min(1, "Please select a state"),
});

export const reportIssueSchema = z.object({
  title: z
    .string()
    .min(1, "Issue title is required")
    .min(3, "Title must be at least 3 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters"),
});

