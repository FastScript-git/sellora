import { z } from "zod";

export const createWebsiteSourceSchema = z.object({
  employeeId: z
    .string()
    .trim()
    .min(1, "AI Employee ID is required"),

  locale: z.enum(["en", "uk"]),

  title: z
    .string()
    .trim()
    .min(2, "Title must contain at least 2 characters")
    .max(120, "Title must contain at most 120 characters"),

  sourceUrl: z
    .string()
    .trim()
    .min(1, "Website URL is required")
    .url("Enter a valid website URL")
    .max(2048, "Website URL is too long")
    .refine(
      (value) => {
        const url = new URL(value);

        return url.protocol === "http:" || url.protocol === "https:";
      },
      {
        message: "Website URL must use HTTP or HTTPS",
      },
    ),
});

export type CreateWebsiteSourceInput = z.infer<
  typeof createWebsiteSourceSchema
>;