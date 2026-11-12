import { apiClient } from "./client";
import type { Folder } from "./folders";
import type { MediaItem } from "./media";

// Reuse the existing folder structure.
// The backend currently returns gameCount for media folders too.
export type MediaFolder = Folder;

export interface CreateMediaFolderInput {
  name: string;
  parentId: string | null;
}

export interface UpdateMediaFolderInput {
  name?: string;
  parentId?: string | null;
}

// Get all media folders
export const getMediaFolders = async (): Promise<MediaFolder[]> => {
  return apiClient<MediaFolder[]>("/media-folders");
};

// Create a media folder
export const createMediaFolder = async (
  input: CreateMediaFolderInput,
): Promise<MediaFolder> => {
  return apiClient<MediaFolder>("/media-folders", {
    method: "POST",
    body: JSON.stringify(input),
  });
};

// Rename or move a media folder
export const updateMediaFolder = async (
  id: string,
  input: UpdateMediaFolderInput,
): Promise<MediaFolder> => {
  return apiClient<MediaFolder>(`/media-folders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
};

// Delete a media folder
export const deleteMediaFolder = async (id: string): Promise<void> => {
  await apiClient<{ success: boolean }>(`/media-folders/${id}`, {
    method: "DELETE",
    body: JSON.stringify({}),
  });
};

// Get media items inside a folder
export const getMediaInFolder = async (
  folderId: string,
): Promise<MediaItem[]> => {
  return apiClient<MediaItem[]>(`/media-folders/${folderId}/media`);
};

// Add a media item to a folder
export const addMediaToFolder = async (
  folderId: string,
  mediaId: string,
): Promise<void> => {
  await apiClient<{ folderId: string; mediaId: string }>(
    `/media-folders/${folderId}/media/${mediaId}`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );
};

// Remove a media item from a folder
export const removeMediaFromFolder = async (
  folderId: string,
  mediaId: string,
): Promise<void> => {
  await apiClient<{ success: boolean }>(
    `/media-folders/${folderId}/media/${mediaId}`,
    {
      method: "DELETE",
      body: JSON.stringify({}),
    },
  );
};

export const getFoldersForMedia = async (
  mediaId: string,
): Promise<MediaFolder[]> => {
  return apiClient<MediaFolder[]>(`/media/${mediaId}/folders`);
};
