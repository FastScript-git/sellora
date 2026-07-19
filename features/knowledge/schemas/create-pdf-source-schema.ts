import { z } from "zod";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export const createPdfSourceSchema = z.object({
  employeeId: z.string().trim().min(1),
  locale: z.enum(["en", "uk"]),

  title: z
    .string()
    .trim()
    .min(2, "Title must contain at least 2 characters.")
    .max(120, "Title is too long."),

  file: z
    .instanceof(File, {
      message: "Please select a PDF file.",
    })
    .refine((file) => file.size > 0, {
      message: "The selected file is empty.",
    })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "Maximum file size is 20 MB.",
    })
    .refine(
      (file) => file.type === "application/pdf",
      {
        message: "Only PDF files are supported.",
      },
    ),
});