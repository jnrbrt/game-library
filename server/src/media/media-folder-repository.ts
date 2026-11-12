import { Repository } from "../storage/repository.js";
import { mediaFoldersStore } from "../storage/stores.js";
import type { Folder } from "../types/models.js";

export const mediaFolderRepository = new Repository<Folder>(mediaFoldersStore);
