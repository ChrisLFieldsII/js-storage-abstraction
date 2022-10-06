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
