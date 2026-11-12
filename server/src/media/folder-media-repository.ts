import { JsonStore } from "../storage/json-store.js";
import { folderMediaStore } from "../storage/stores.js";
import type { FolderMedia } from "../types/models.js";

export class FolderMediaRepository {
  constructor(private readonly store: JsonStore<FolderMedia[]>) {}

  async getAll(): Promise<FolderMedia[]> {
    return this.store.read();
  }

  async getMediaInFolder(folderId: string): Promise<FolderMedia[]> {
    const relations = await this.store.read();

    return relations.filter((relation) => relation.folderId === folderId);
  }

  async getFoldersForMedia(mediaId: string): Promise<FolderMedia[]> {
    const relations = await this.store.read();

    return relations.filter((relation) => relation.mediaId === mediaId);
  }

  async add(folderId: string, mediaId: string): Promise<FolderMedia> {
    const relations = await this.store.read();

    const exists = relations.some(
      (relation) =>
        relation.folderId === folderId && relation.mediaId === mediaId,
    );

    if (exists) {
      throw new Error("Media is already in this folder.");
    }

    const relation: FolderMedia = {
      folderId,
      mediaId,
    };

    relations.push(relation);

    await this.store.write(relations);

    return relation;
  }

  async remove(folderId: string, mediaId: string): Promise<boolean> {
    const relations = await this.store.read();

    const filteredRelations = relations.filter(
      (relation) =>
        relation.folderId !== folderId || relation.mediaId !== mediaId,
    );

    if (filteredRelations.length === relations.length) {
      return false;
    }

    await this.store.write(filteredRelations);

    return true;
  }
}

export const folderMediaRepository = new FolderMediaRepository(
  folderMediaStore,
);
