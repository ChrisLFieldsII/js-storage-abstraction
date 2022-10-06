# js-storage-abstraction

## Description

An abstraction to use the many different storage libraries in the js ecosystem

Build your apps `storage` object with `Keys`

Provides an abstract `Key` class that you can extend to make keys of all types.

For example, make a `Key` that uses `AsyncStorage` or make a `Key` that uses `SecureStorage` or make a `Key` that uses `SessionStorage`, etc.

## Features

- Stores everything as a `string` but provides helper methods for storing/getting data of different types like `number`, `date`, `boolean`, `json`.
- Storage keys are based off a string union so you can centralize apps known storage keys. Very TypeScript friendly!

## Code!

```typescript
import { Key, TypedStorage, JSStorage } from 'js-storage-abstraction';

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
const typedStorage: TypedStorage<StorageId> = {
  stringType: new AsyncKey('stringType'),
  boolType: new MysteriousKey('boolType'),
  numType: new MultipartSecureKey('numType'),
  dateType: new SessionKey('dateType'),
  jsonType: new SecureKey('jsonType'),
};

typedStorage.stringType.set('hello world');

/**
 * Wrap your storage with `JSStorage` class to gain access to functionality like
 * `clear` whole storage or `getJSON` to get current storage as json object
 */
const storage = new JSStorage(typedStorage);

const stringTypeKey: Key = storage.use('stringType'); // the `use` function can retrieve a `Key` from `typedStorage`
stringTypeKey.set('hello world');

const numTypeKey: Key = storage.use('numType');
numTypeKey.setNumber(7);

storage.clear(); // delete whole storage

const storageJSON = storage.getJSON(); // get current storage as json object. useful for debugging, displaying in UI
```

## Examples

- Check out the test file [test.ts](./test.ts)
- Check out example react app [App.tsx](./example/src/App.tsx)

## Improvements

- make `Keys` out of the box for common storage providers. basically did this in example app with `localStorage` and `sessionStorage`
- improve naming of package and `JSStorage`??
