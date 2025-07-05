import { z } from "zod";

export const authSchema = z.object({
  username: z.string().min(3, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type AuthSchema = z.infer<typeof authSchema>;
