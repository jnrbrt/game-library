import { folderRepository } from "./folder-repository.js";

export const wouldCreateFolderCycle = async (
  folderId: string,
  parentId: string,
): Promise<boolean> => {
  let currentParentId: string | null = parentId;

  while (currentParentId !== null) {
    if (currentParentId === folderId) {
      return true;
    }

    const parentFolder = await folderRepository.getById(currentParentId);

    if (!parentFolder) {
      return false;
    }

    currentParentId = parentFolder.parentId;
  }

  return false;
};
