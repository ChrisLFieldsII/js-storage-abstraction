import React, { useState } from 'react';
import './App.css';
import { Key, TypedStorage, JSStorage } from 'js-storage-abstraction';

type StorageId = 'persistentName' | 'sessionName';

class LocalStorageKey extends Key<StorageId> {
  async get(): Promise<string | null> {
    return localStorage.getItem(this.name);
  }

  async set(value: string): Promise<void> {
    await localStorage.setItem(this.name, value);
  }

  async delete(): Promise<void> {
    await localStorage.removeItem(this.name);
  }
}

class SessionStorageKey extends Key<StorageId> {
  async get(): Promise<string | null> {
    return sessionStorage.getItem(this.name);
  }

  async set(value: string): Promise<void> {
    await sessionStorage.setItem(this.name, value);
  }

  async delete(): Promise<void> {
    await sessionStorage.removeItem(this.name);
  }
}

const typedStorage: TypedStorage<StorageId> = {
  persistentName: new LocalStorageKey('persistentName'),
  sessionName: new SessionStorageKey('sessionName'),
};
const storage = new JSStorage(typedStorage);

function App() {
  const [persistentText, setPersistentText] = useState('');
  const [sessionText, setSessionText] = useState('');

  return (
    <div className="App">
      <br />

      <input
        type="text"
        onChange={(e) => setPersistentText(e.currentTarget.value)}
      />
      <button
        onClick={() => {
          storage.use('persistentName').set(persistentText);
          console.log('set persistent');
        }}
      >
        set persistent text
      </button>

      <br />
      <br />

      <input
        type="text"
        onChange={(e) => setSessionText(e.currentTarget.value)}
      />
      <button
        onClick={() => {
          storage.use('sessionName').set(sessionText);
          console.log('set session');
        }}
      >
        set session text
      </button>

      <br />
      <br />

      <button onClick={storage.clear}>clear storage</button>

      <br />
      <br />

      <button
        onClick={() => {
          storage.getJSON().then(console.log);
        }}
      >
        print storage
      </button>
    </div>
  );
}

export default App;
