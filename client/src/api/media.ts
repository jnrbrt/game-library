import { apiClient } from "./client";

export type MediaType = "movie" | "series" | "book";

export type MediaStatus =
  | "finished"
  | "ongoing"
  | "paused"
  | "dropped"
  | "waiting-list";

export const MEDIA_GENRES = [
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
] as const;

export type MediaGenre = (typeof MEDIA_GENRES)[number];

export interface MediaItem {
  id: string;
  ownerId: string;
  title: string;
  type: MediaType;
  genres: MediaGenre[];
  status: MediaStatus;
  score?: number;
  description?: string;
  createdAt: string;
}

export interface CreateMediaInput {
  title: string;
  type: MediaType;
  genres: MediaGenre[];
  status: MediaStatus;
  score?: number;
  description?: string;
}

export type UpdateMediaInput = Omit<Partial<CreateMediaInput>, "score"> & {
  score?: number | null;
};

export const getMedia = async (): Promise<MediaItem[]> => {
  return apiClient<MediaItem[]>("/media");
};

export const getMediaById = async (id: string): Promise<MediaItem> => {
  return apiClient<MediaItem>(`/media/${id}`);
};

export const createMedia = async (
  input: CreateMediaInput,
): Promise<MediaItem> => {
  return apiClient<MediaItem>("/media", {
    method: "POST",
    body: JSON.stringify(input),
  });
};

export const updateMedia = async (
  id: string,
  input: UpdateMediaInput,
): Promise<MediaItem> => {
  return apiClient<MediaItem>(`/media/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
};

export const deleteMedia = async (id: string): Promise<void> => {
  await apiClient<{ success: boolean }>(`/media/${id}`, {
    method: "DELETE",
    body: JSON.stringify({}),
  });
};
