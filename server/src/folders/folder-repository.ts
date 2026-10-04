import { Repository } from "../storage/repository.js";
import type { Folder } from "../types/models.js";
import { foldersStore } from "../storage/stores.js";

export const folderRepository = new Repository<Folder>(foldersStore);
