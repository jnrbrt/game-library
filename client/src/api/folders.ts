import { apiClient } from "./client";

export interface Folder {
  id: string;
  ownerId: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

export interface CreateFolderInput {
  name: string;
  parentId: string | null;
}

export interface UpdateFolderInput {
  name?: string;
  parentId?: string | null;
}

export const getFolders = async (): Promise<Folder[]> => {
  return apiClient<Folder[]>("/folders");
};

export const createFolder = async (
  input: CreateFolderInput,
): Promise<Folder> => {
  return apiClient<Folder>("/folders", {
    method: "POST",
    body: JSON.stringify(input),
  });
};

export const updateFolder = async (
  id: string,
  input: UpdateFolderInput,
): Promise<Folder> => {
  return apiClient<Folder>(`/folders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
};

export const deleteFolder = async (id: string): Promise<void> => {
  await apiClient<{ success: boolean }>(`/folders/${id}`, {
    method: "DELETE",
    body: JSON.stringify({}),
  });
};

export const getGamesInFolder = async (folderId: string) => {
  return apiClient<import("./games").Game[]>(`/folders/${folderId}/games`);
};

export const addGameToFolder = async (
  folderId: string,
  gameId: string,
): Promise<void> => {
  await apiClient<{ success: boolean }>(
    `/folders/${folderId}/games/${gameId}`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );
};

export const removeGameFromFolder = async (
  folderId: string,
  gameId: string,
): Promise<void> => {
  await apiClient<{ success: boolean }>(
    `/folders/${folderId}/games/${gameId}`,
    {
      method: "DELETE",
      body: JSON.stringify({}),
    },
  );
};

export const getFoldersForGame = async (gameId: string): Promise<Folder[]> => {
  return apiClient<Folder[]>(`/games/${gameId}/folders`);
};
