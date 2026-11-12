import { z } from "zod";

const mediaTypeSchema = z.enum(["movie", "series", "book"]);

const mediaStatusSchema = z.enum([
  "finished",
  "ongoing",
  "paused",
  "dropped",
  "waiting-list",
]);

const mediaGenreSchema = z.enum([
  "action",
  "adventure",
  "animation",
  "comedy",
  "crime",
  "documentary",
  "drama",
  "fantasy",
  "historical",
  "horror",
  "mystery",
  "romance",
  "sci-fi",
  "thriller",
  "war",
  "western",
  "biography",
  "family",
  "musical",
  "supernatural",
  "slice-of-life",
]);

export const createMediaSchema = z.object({
  title: z.string().trim().min(1).max(200),

  type: mediaTypeSchema,

  genres: z.array(mediaGenreSchema).min(1),

  status: mediaStatusSchema,

  score: z
    .number()
    .min(1)
    .max(10)
    .refine(
      (value) => Number.isInteger(value * 10),
      "Score can have at most one decimal place.",
    )
    .optional(),

  description: z.string().trim().max(5000).optional(),
});

export const updateMediaSchema = createMediaSchema.partial().extend({
  score: createMediaSchema.shape.score.nullable(),
});
