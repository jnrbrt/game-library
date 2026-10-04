import { z } from "zod";

export const createFolderSchema = z.object({
  name: z.string().trim().min(1).max(200),
  parentId: z.string().nullable(),
});

export const updateFolderSchema = createFolderSchema.partial();
