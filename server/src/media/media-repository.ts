import { Repository } from "../storage/repository.js";
import { mediaStore } from "../storage/stores.js";
import type { MediaItem } from "../types/models.js";

export const mediaRepository = new Repository<MediaItem>(mediaStore);
