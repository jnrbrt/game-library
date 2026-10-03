import { JsonStore } from "./json-store.js";
import { generateId } from "../utils/id.js";

export class Repository<T extends { id: string }> {
  constructor(private readonly store: JsonStore<T[]>) {}

  async getAll(): Promise<T[]> {
    return this.store.read();
  }

  async getById(id: string): Promise<T | undefined> {
    const items = await this.store.read();

    return items.find((item) => item.id === id);
  }

  async create(item: Omit<T, "id">): Promise<T> {
    const items = await this.store.read();

    const newItem = {
      ...item,
      id: generateId(),
    } as T;

    items.push(newItem);

    await this.store.write(items);

    return newItem;
  }

  async update(
    id: string,
    updates: Partial<Omit<T, "id">>,
  ): Promise<T | undefined> {
    const items = await this.store.read();

    const index = items.findIndex((item) => item.id === id);

    if (index === -1) {
      return undefined;
    }

    const updatedItem = {
      ...items[index],
      ...updates,
      id,
    };

    items[index] = updatedItem;

    await this.store.write(items);

    return updatedItem;
  }

  async delete(id: string): Promise<boolean> {
    const items = await this.store.read();

    const filteredItems = items.filter((item) => item.id !== id);

    if (filteredItems.length === items.length) {
      return false;
    }

    await this.store.write(filteredItems);

    return true;
  }
}
