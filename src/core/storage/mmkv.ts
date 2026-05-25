import { MMKV } from "react-native-mmkv";

export const storage = new MMKV({ id: "andokensaku" });

const noop = () => undefined;

type Codec<T> = {
  encode: (value: T) => string;
  decode: (raw: string) => T;
};

const jsonCodec = <T>(): Codec<T> => ({
  encode: (v) => JSON.stringify(v),
  decode: (raw) => JSON.parse(raw) as T,
});

export function readJson<T>(key: string, fallback: T): T {
  const raw = storage.getString(key);
  if (raw === undefined) return fallback;
  try {
    return jsonCodec<T>().decode(raw);
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T): void {
  try {
    storage.set(key, jsonCodec<T>().encode(value));
  } catch {
    noop();
  }
}

export function remove(key: string): void {
  storage.delete(key);
}

export function clearAll(): void {
  storage.clearAll();
}
