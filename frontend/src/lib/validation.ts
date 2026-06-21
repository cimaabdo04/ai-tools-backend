import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
    ref: z.string().optional(),
    clickId: z.string().optional(),
    token: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const toolSubmissionSchema = z.object({
  name: z.string().min(2, "Name is required").max(200),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000),
  website: z.string().url("Must be a valid URL"),
  categoryId: z.string().uuid("Invalid category"),
  pricingModel: z.enum(["free", "freemium", "paid", "contact"]),
  pricingStartingAt: z.number().min(0).optional(),
  tags: z.array(z.string()).min(1, "At least one tag is required").max(10),
  logo: z.string().url().optional().or(z.literal("")),
  screenshot: z.string().url().optional().or(z.literal("")),
  videoUrl: z.string().url().optional().or(z.literal("")),
  features: z.array(z.string()).max(20).optional(),
  useCases: z.array(z.string()).max(10).optional(),
  platforms: z.array(z.enum(["web", "ios", "android", "mac", "windows", "linux", "api", "chrome"])).optional(),
  twitterUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  discordUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "submitted"]).optional(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1, "Rating is required").max(5),
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  content: z.string().min(10, "Review must be at least 10 characters").max(5000),
  pros: z.string().max(1000).optional(),
  cons: z.string().max(1000).optional(),
  recommended: z.boolean().optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2).max(100),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  twitterUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
});

export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(5000),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  parentId: z.string().uuid().optional().or(z.literal("")),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ToolSubmissionInput = z.infer<typeof toolSubmissionSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
