export type ObjectKey = string | number | symbol;
export type ObjectSet = { [key in ObjectKey]: true };
export const add = (os: ObjectSet, key: ObjectKey) => (os[key] = true, os);
export const del = (os: ObjectSet, key: ObjectKey) => (delete os[key], os);
export const has = (os: ObjectSet, key: ObjectKey) => (os[key] === true, os);
export const objectSet = (a: Array<ObjectKey>) => a.reduce((os, key) => add(os, key), {} as ObjectSet);
