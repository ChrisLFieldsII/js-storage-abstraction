import { JSStorage, Key, TypedStorage } from './src';
import test from 'ava';

/* 
  the goal is to test abstract class helper methods behave as expected
*/
type InMemoryStorage = Record<string, any>;
let inMemoryStorage: InMemoryStorage = {};

/** the storage ids that your app uses */
type StorageId = 'boolType' | 'numType' | 'dateType' | 'jsonType';

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
  boolType: new MysteriousKey('boolType'),
  numType: new MultipartSecureKey('numType'),
  dateType: new SessionKey('dateType'),
  jsonType: new SecureKey('jsonType'),
};
const storage = new JSStorage(typedStorage);
const constantDate = new Date();
const expectedStorage = {
  numType: 7,
  dateType: constantDate.toISOString(),
  boolType: false,
  jsonType: {
    name: 'chris',
  },
};

/** @desc returns object where all values are guaranteed strings */
const stringifyObject = (
  obj: Record<string, unknown>
): Record<string, string> => {
  const cast = (value: any): string => {
    const castValue = value + ''; // cast to string

    // assume json
    if (castValue === '[object Object]') {
      return JSON.stringify(value);
    }

    return castValue;
  };

  return Object.keys(obj).reduce((accum, key) => {
    return {
      ...accum,
      [key]: cast(obj[key]),
    };
  }, {});
};

test.serial('key.getNum', async (t) => {
  // lucky number 7
  const expected = expectedStorage.numType;

  await storage.use('numType').setNumber(expected);

  const actual = await storage.use('numType').getNumber();
  t.is(actual, expected);
});

test.serial('key.getDate', async (t) => {
  const expected = expectedStorage.dateType;
  await storage.use('dateType').setDate(constantDate);

  const actual = (await storage.use('dateType').getDate()).toISOString();
  t.is(actual, expected);
});

test.serial('key.getBool', async (t) => {
  let expected = true;
  await storage.use('boolType').setBoolean(expected);
  let actual = await storage.use('boolType').getBoolean();
  t.is(actual, expected);

  expected = false;
  await storage.use('boolType').setBoolean(expected);
  actual = await storage.use('boolType').getBoolean();
  t.is(actual, expected);
});

test.serial('key.getJSON', async (t) => {
  const expected = expectedStorage.jsonType;

  await storage.use('jsonType').setJSON(expected);
  const actual = await storage.use('jsonType').getJSON<typeof expected>();
  t.deepEqual(actual, expected);
});

test.serial('storage.getJSON', async (t) => {
  const expected = stringifyObject(expectedStorage);
  const actual = await storage.getJSON();
  t.deepEqual(actual, expected);
});

test.serial('storage.clear', async (t) => {
  const expected: Record<StorageId, undefined> = {
    boolType: undefined,
    dateType: undefined,
    jsonType: undefined,
    numType: undefined,
  };
  const actual = await storage.clear().then(() => storage.getJSON());

  t.deepEqual(actual, expected);
});
