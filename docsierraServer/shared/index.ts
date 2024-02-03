type WordId = string;
//type Word = string;

type Token = {
  type: TokenType;
}

const tokenTypes = [
  'unresolved', 'resolved', 'path', 'labeling'
] as const;
type TokenType = typeof tokenTypes[number];

//#region Word

export const wordTypes = [ 'unresolved', 'resolved' ] as const;
export const isWord = (token: Token): token is WordToken => wordTypes.includes(token.type as any);

export type WordToken =
  | UnresolvedWord
  | ResolvedWord
  ;

export interface UnresolvedWord extends Token {
  type: 'unresolved';
  word: string;
}

export interface ResolvedWord extends Token {
  type: 'resolved';
  word: string;
  wordId: string;
}

//#endregion Word

export type PathToken = {
  type: 'path';
  children: Singleton[];
}

export type LabelingToken = {
  type: 'labeling';
  children: Singleton[];
}

export const isSingleton = (token: Token): token is Singleton => true;
export type Singleton = 
  | WordToken
  | PathToken
  | LabelingToken
  ;

export type LazyFetch<T> = undefined | null | T | Promise<T>;

export type WordResolution = {
  wordId: WordId;
  path: LazyFetch<WordId[]>;
  labels: LazyFetch<WordId[]>;
}