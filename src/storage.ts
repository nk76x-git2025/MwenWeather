import type { ExportFile, WeatherLog } from './types';

const DB_NAME = 'mwenweather-local';
const DB_VERSION = 1;
const LOG_STORE = 'weatherLogs';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(LOG_STORE)) {
        const store = db.createObjectStore(LOG_STORE, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt');
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T> | void): Promise<T> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(LOG_STORE, mode);
    const store = transaction.objectStore(LOG_STORE);
    const request = action(store);
    let result = undefined as T;

    if (request) {
      request.onsuccess = () => {
        result = request.result;
      };
      request.onerror = () => reject(request.error);
    }

    transaction.oncomplete = () => {
      db.close();
      resolve(result);
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function getLogs(): Promise<WeatherLog[]> {
  const logs = await withStore<WeatherLog[]>('readonly', (store) => store.getAll());
  return logs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveLog(log: WeatherLog): Promise<void> {
  await withStore('readwrite', (store) => store.put(log));
}

export async function replaceLogs(logs: WeatherLog[]): Promise<void> {
  await withStore('readwrite', (store) => {
    store.clear();
    logs.forEach((log) => store.put(log));
  });
}

export function buildExport(logs: WeatherLog[]): ExportFile {
  return {
    app: 'MwenWeather',
    version: 1,
    exportedAt: new Date().toISOString(),
    logs,
  };
}

export function parseExport(text: string): WeatherLog[] {
  const parsed = JSON.parse(text) as Partial<ExportFile>;
  if (parsed.app !== 'MwenWeather' || parsed.version !== 1 || !Array.isArray(parsed.logs)) {
    throw new Error('This is not a valid MwenWeather export file.');
  }
  return parsed.logs;
}
