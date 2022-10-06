/**
 * Key interface with helper methods for parsing types
 */
export interface IKey {
  get(): Promise<string | void | null>;
  set(value: string): Promise<void>;
  delete(): Promise<void>;
  getBoolean(): Promise<boolean>;
  setBoolean(value: boolean): Promise<void>;
  getNumber(): Promise<number>;
  setNumber(value: number): Promise<void>;
  getDate(): Promise<Date>;
  setDate(value: Date): Promise<void>;
  getJSON<T>(): Promise<T>;
  setJSON(value: any): Promise<void>;
}

type KeyId = string;

// NOTE: assume happy path. clients can deal with errors. dont want to assume their return values.
/**
 * Abstract class to implement your keys.
 * Keys can be powered by any storage system!
 *
 * Only need to override `get`, `set`, `delete`.
 */
export abstract class Key<T extends KeyId> implements IKey {
  constructor(public name: T) {}

  abstract get(): Promise<string | null>;
  abstract set(value: string): Promise<void>;
  abstract delete(): Promise<void>;

  async getBoolean(): Promise<boolean> {
    return (await this.get()) === 'true';
  }
  async setBoolean(value: boolean): Promise<void> {
    await this.set(value ? 'true' : 'false');
  }

  async getNumber(): Promise<number> {
    return Number(await this.get());
  }
  async setNumber(value: number): Promise<void> {
    await this.set(value.toString());
  }

  async getDate(): Promise<Date> {
    return new Date((await this.get()) as string);
  }
  async setDate(value: Date): Promise<void> {
    await this.set(value.toISOString());
  }

  async getJSON<T>(): Promise<T> {
    return JSON.parse((await this.get()) as string) as T;
  }
  async setJSON(value: any): Promise<void> {
    await this.set(JSON.stringify(value));
  }
}

/**
 * Type for your `storage` object
 */
export type TypedStorage<T extends KeyId> = Record<T, Key<T>>;

export interface IStorage<T extends KeyId> {
  /** Use a key in storage */
  use(key: T): Key<T>;
  /**
   * Delete all keys in storage
   */
  clear(): Promise<void>;
  /** get storage as json object */
  getJSON(): Promise<Record<T, string | undefined>>;
}

export type JSStorageConfig<T extends KeyId> = {
  storage: TypedStorage<T>;
};

/**
 * Convenience storage object that wraps `TypedStorage` to provide
 * common functionalities like using a key, clearing whole storage,
 * getting storage as json, etc
 */
export class JSStorage<T extends KeyId> implements IStorage<T> {
  constructor(private config: JSStorageConfig<T>) {}

  use(key: T): Key<T> {
    return this.config.storage[key];
  }

  async clear(): Promise<void> {
    const { storage } = this.config;

    const keys = Object.keys(storage) as T[];

    const promises = keys.map((key) => {
      return storage[key].delete();
    });

    await Promise.all(promises);
  }

  async getJSON(): Promise<Record<T, string | undefined>> {
    const { storage } = this.config;

    const keys = Object.keys(storage) as T[];

    const promises = keys.map((key) => {
      return storage[key].get();
    });

    const values = await Promise.all(promises);

    return keys.reduce((accum, key, index) => {
      return {
        ...accum,
        [key]: values[index],
      };
    }, {} as Record<T, string | undefined>);
  }
}
