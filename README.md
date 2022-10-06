# js-storage-abstraction

An abstraction to use the many different storage libraries in the js ecosystem

Build your apps `storage` object with `Keys`

Provides an abstract `Key` class that you can extend to make keys of all types.

For example, make a `Key` that uses `AsyncStorage` or make a `Key` that uses `SecureStorage` or make a `Key` that uses `SessionStorage`, etc.

## Features

- Stores everything as a `string` but provides helper methods for storing/getting data of different types like `number`, `date`, `boolean`, `json`.
- Storage keys are based off a string union so you can centralize apps known storage keys. Very TypeScript friendly!

```typescript
import { Key, TypedStorage } from 'js-storage-abstraction';

let inMemoryStorage: Record<string, any> = {};

/** the storage ids that your app uses */
type StorageId =
  | 'stringType'
  | 'boolType'
  | 'numType'
  | 'dateType'
  | 'jsonType';

/**
 * This key would pull from async storage
 */
class AsyncKey extends Key<StorageId> {
  get(): Promise<string | null> {
    return inMemoryStorage[this.name];
  }

  async set(value: string): Promise<void> {
    inMemoryStorage[this.name] = value;
  }

  async delete(): Promise<void> {
    delete inMemoryStorage[this.name];
  }
}

/*
  The below key subclasses are just examples of how there can be many different types of `Keys`
  You would still need to override the `get`, `set, & `delete` methods with the appropriate logic.
*/

/**
 * This key would pull from secure storage
 * (but we just extend AsyncKey here for illustration purposes)
 */
class SecureKey extends AsyncKey {}

/**
 * This key would use session storage
 */
class SessionKey extends AsyncKey {}

/**
 * This key takes care of splitting a long value into parts for storages that have item limits
 */
class MultipartSecureKey extends AsyncKey {}

/**
 * This key saves its values in a mysterious format...
 */
class MysteriousKey extends AsyncKey {}

/**
 * your storage is just an object where value is of subclass `Key`
 */
const storage: TypedStorage<StorageId> = {
  stringType: new AsyncKey('stringType'),
  boolType: new MysteriousKey('boolType'),
  numType: new MultipartSecureKey('numType'),
  dateType: new SessionKey('dateType'),
  jsonType: new SecureKey('jsonType'),
};
```
