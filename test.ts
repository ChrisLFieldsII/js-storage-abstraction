import { Key } from './src';
import test from 'ava';

/* 
  the goal is to test abstract class helper methods behave as expected
*/

let inMemoryStorage: Record<string, any> = {};

/**
 * This key would pull from async storage
 */
class AsyncKey extends Key {
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
const storage = {
  stringType: new AsyncKey('stringType'),
  boolType: new MysteriousKey('boolType'),
  numType: new MultipartSecureKey('numType'),
  dateType: new SessionKey('dateType'),
  jsonType: new SecureKey('jsonType'),
};

test('getNum', async (t) => {
  // lucky number 7
  const expected = 7;

  await storage.numType.setNumber(expected);

  const actual = await storage.numType.getNumber();
  t.is(actual, expected);
});

test('getDate', async (t) => {
  const date = new Date();
  const expected = date.toISOString();
  await storage.dateType.setDate(date);

  const actual = (await storage.dateType.getDate()).toISOString();
  t.is(actual, expected);
});

test('getBool', async (t) => {
  let expected = true;
  await storage.boolType.setBoolean(expected);
  let actual = await storage.boolType.getBoolean();
  t.is(actual, expected);

  expected = false;
  await storage.boolType.setBoolean(expected);
  actual = await storage.boolType.getBoolean();
  t.is(actual, expected);
});

test('getJSON', async (t) => {
  const expected = {
    name: 'chris',
  };

  await storage.jsonType.setJSON(expected);
  const actual = await storage.jsonType.getJSON<typeof expected>();
  t.deepEqual(actual, expected);
});
