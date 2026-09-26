import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = ["application/pdf"];

export const applicationSchema = z.object({
  // Personal Information section
  fullName: z.string().trim().refine((value) => value.split(/\s+/).length >= 2, "Please enter your first and last name"),

  email: z
    .string()
    .trim()
    .min(1, "Please fill out section")
    .email("Please enter a valid email"),

  phone: z.string().trim().min(1, "Phone number is required"),

  address: z.string().trim().min(1, "Address is required"),

  city: z.string().trim().min(1, "City is required"),

  state: z.string().min(1, "State is required"),

  postcode: z.string().trim().min(1, "Post code is required"),

  privacyAccepted: z
    .boolean()
    .refine((value) => value, "You must agree to the privacy notice"),

  // Application Details section
  internshipProgram: z.string().min(1, "Please select an internship program"),

  university: z.string().trim().min(1, "University / Institute is required"),

  graduationYear: z.string().min(1, "Expected graduation year is required"),

  motivation: z.string().trim().min(1, "Please tell us why you are interested"),

  // Documents section
  resume: z
    .instanceof(File)
    .nullable()
    .refine((file) => file !== null, "Resume / CV is required")
    .refine(
      (file) => !file || ALLOWED_FILE_TYPES.includes(file.type),
      "Please upload a PDF file",
    )
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      "File must be 5MB or smaller",
    ),

  coverLetter: z
    .instanceof(File)
    .nullable()
    .refine(
      (file) => !file || ALLOWED_FILE_TYPES.includes(file.type),
      "Please upload a PDF file",
    )
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      "File must be 5MB or smaller",
    ),
});

export type ApplicationFormData = z.input<typeof applicationSchema>;

export type ApplicationData = z.output<typeof applicationSchema>;
