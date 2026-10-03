import { JsonStore } from "./json-store.js";
import type { FolderGame } from "../types/models.js";

export class FolderGameRepository {
  constructor(private readonly store: JsonStore<FolderGame[]>) {}

  async getAll(): Promise<FolderGame[]> {
    return this.store.read();
  }

  async getGamesInFolder(folderId: string): Promise<FolderGame[]> {
    const relations = await this.store.read();

    return relations.filter((relation) => relation.folderId === folderId);
  }

  async getFoldersForGame(gameId: string): Promise<FolderGame[]> {
    const relations = await this.store.read();

    return relations.filter((relation) => relation.gameId === gameId);
  }

  async add(folderId: string, gameId: string): Promise<FolderGame> {
    const relations = await this.store.read();

    const exists = relations.some(
      (relation) =>
        relation.folderId === folderId && relation.gameId === gameId,
    );

    if (exists) {
      throw new Error("Game is already in this folder.");
    }

    const relation: FolderGame = {
      folderId,
      gameId,
    };

    relations.push(relation);

    await this.store.write(relations);

    return relation;
  }

  async remove(folderId: string, gameId: string): Promise<boolean> {
    const relations = await this.store.read();

    const filteredRelations = relations.filter(
      (relation) =>
        relation.folderId !== folderId || relation.gameId !== gameId,
    );

    if (filteredRelations.length === relations.length) {
      return false;
    }

    await this.store.write(filteredRelations);

    return true;
  }
}
