import { createSeed } from '../data/seed.js';

const DATABASE = 'veldridge-workspace-v1';
let opening;
export async function database() {
  if (!opening) {
    opening = new Promise((resolve, reject) => {
      if (!globalThis.indexedDB) { reject(new Error('Browser storage is unavailable. Enable IndexedDB to use this demo.')); return; }
      const request = indexedDB.open(DATABASE, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore('content');
        request.result.createObjectStore('media', { keyPath: 'id' });
        request.result.createObjectStore('inquiries', { keyPath: 'id' });
      };
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Close other tabs using this workspace, then retry.'));
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => { db.close(); opening = null; };
        // Seed once, in a single read/write transaction. Other tabs cannot race it.
        const tx = db.transaction(['content','media','inquiries'], 'readwrite');
        const read = tx.objectStore('content').get('workspace');
        read.onsuccess = () => {
          if (read.result !== undefined) return;
          const seed = createSeed();
          tx.objectStore('content').add(seed.content, 'workspace');
          seed.media.forEach((item) => tx.objectStore('media').add(item));
          seed.inquiries.forEach((item) => tx.objectStore('inquiries').add(item));
        };
        tx.oncomplete = () => resolve(db);
        tx.onabort = () => { db.close(); reject(tx.error || new Error('Could not initialize local storage.')); };
      };
    }).catch((error) => { opening = null; throw error; });
  }
  return opening;
}

export async function readStore(store, key) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const request = key === undefined ? tx.objectStore(store).getAll() : tx.objectStore(store).get(key);
    tx.oncomplete = () => resolve(request.result);
    tx.onabort = () => reject(tx.error || new Error('Could not read browser storage.'));
  });
}

// The updater is synchronous: asynchronous work must happen BEFORE the transaction.
// Success is only reported after transaction.oncomplete, not request.onsuccess.
export async function updateStore(store, key, updater) {
  const db = await database();
  return new Promise((resolve, reject) => {
    let result;
    let failure;
    const tx = db.transaction(store, 'readwrite');
    const bucket = tx.objectStore(store);
    const request = bucket.get(key);
    request.onsuccess = () => {
      try {
        result = updater(request.result);
        if (result === undefined) bucket.delete(key);
        else if (store === 'content') bucket.put(result, key);
        else bucket.put(result);
      } catch (error) { failure = error; tx.abort(); }
    };
    tx.oncomplete = () => resolve(result);
    tx.onabort = () => reject(failure || tx.error || new Error('Browser storage could not save the changes.'));
  });
}
export async function replaceWorkspace(content, media, inquiries) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(inquiries === undefined ? ['content','media'] : ['content','media','inquiries'], 'readwrite');
    tx.objectStore('content').put(content, 'workspace');
    for (const [name, rows] of [['media',media],['inquiries',inquiries]]) {
      if (rows === undefined) continue;
      const store = tx.objectStore(name);
      store.clear();
      rows.forEach((row) => store.put(row));
    }
    tx.oncomplete = resolve;
    tx.onabort = () => reject(tx.error || new Error('Import failed. Your existing data was not changed.'));
  });
}

export async function addMediaBatch(rows) {
  const db = await database();
  return new Promise((resolve,reject) => {
    const tx = db.transaction('media','readwrite');
    rows.forEach((row) => tx.objectStore('media').add(row));
    tx.oncomplete = resolve;
    tx.onabort = () => reject(tx.error || new Error('Could not save images. No images in this batch were added.'));
  });
}
