import { promises as fs } from 'fs';
import { Err, noThrow } from './lang';

export const exists = (path: string) => noThrow(() => fs.stat(path));

export const onlyCreate = async (path: string, data: string) =>
  await exists(path) 
    ? Err(`File already exists at ${path}`) 
    : fs.writeFile(path, data);