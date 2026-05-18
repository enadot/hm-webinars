// Minimal get/set by dot-path. Supports array indices: "speakers.list.0.name"

type AnyRecord = Record<string, unknown>;

export function getByPath<T = unknown>(obj: unknown, path: string): T | undefined {
  if (!path) return undefined;
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc == null) return undefined;
    if (Array.isArray(acc) && /^\d+$/.test(key)) return acc[Number(key)];
    return (acc as AnyRecord)[key];
  }, obj) as T | undefined;
}

export function setByPath<T>(obj: T, path: string, value: unknown): T {
  const result = structuredClone(obj) as unknown;
  const keys = path.split(".");
  let cursor = result as AnyRecord | unknown[];
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (Array.isArray(cursor) && /^\d+$/.test(key)) {
      cursor = cursor[Number(key)] as AnyRecord | unknown[];
    } else {
      cursor = (cursor as AnyRecord)[key] as AnyRecord | unknown[];
    }
  }
  const lastKey = keys[keys.length - 1];
  if (Array.isArray(cursor) && /^\d+$/.test(lastKey)) {
    (cursor as unknown[])[Number(lastKey)] = value;
  } else {
    (cursor as AnyRecord)[lastKey] = value;
  }
  return result as T;
}
