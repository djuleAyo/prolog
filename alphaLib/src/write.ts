import { range } from "../../pkgs/array";
import { Err, cl } from "../../pkgs/lang";
import { plAll } from "./pl";


type Translation = {
  word: string;
  wordId: string;
}
/** Maps how many same words appear in database */
export const wordIdMap = {} as Record<string, Translation[]>

export const newWordEntry = (w: string) => {
  if (!(w in wordIdMap)) wordIdMap[w] = [];
  
  const count = wordIdMap[w].length;
  
  wordIdMap[w].push({
    word: w,
    wordId: makeWordId(w, count),
  })
  return wordIdMap[w].at(-1)!
}
const makeWordId = (w: string, count: number) => `${w}${count ? `_${count}` : ''}`
  
export const wordIds = (w: string) => {
  return range(wordIdMap[w].length + 1).map(i => makeWordId(w, i))
}

export type Word = string;
export type ResolvedWord = {
  word: string;
  wordId: string;
  path?: Word[];
  shadow?: any[];
}

export const resolveUnique = (w: string, ancestor?: string): ResolvedWord => {
  const count = wordIdMap[w].length
  if (count === 1) return {
    word: w, wordId: w
  } as ResolvedWord
  
  //count > 1
  if (!ancestor) Err(`Word ${w} is ambiguous. Specify resolution.`)

  const ids = wordIds(w)
  cl(ids)
  const paths = ids.map(id => plAll`path(${id}, P)`)

  cl(paths)

  return undefined as any
}