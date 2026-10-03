import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import path from "node:path";

export class JsonStore<T> {
  constructor(private readonly filePath: string) {}

  async read(): Promise<T> {
    const content = await readFile(this.filePath, "utf-8");
    return JSON.parse(content) as T;
  }

  async write(data: T): Promise<void> {
    const directory = path.dirname(this.filePath);

    await mkdir(directory, { recursive: true });

    const tempPath = `${this.filePath}.tmp`;

    await writeFile(tempPath, JSON.stringify(data, null, 2), "utf-8");

    await rename(tempPath, this.filePath);
  }
}
