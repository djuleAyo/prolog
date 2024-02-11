interface TokenBasis {
  type: TokenType;
}

const tokenTypes = [
  'urw', 'rw', '/', '.', ' ', '|'
] as const;
type TokenType = typeof tokenTypes[number];

export const lt = (a: TokenType, b: TokenType) => {
  if (a === '/' && b === '.') return true;
  if (a === '.' && b === '/') return true;
  return tokenTypes.indexOf(a) > tokenTypes.indexOf(b);
}

//#region Word

export const wordTypes = [ 'urw', 'rw' ] as const;
export const isWord = (token: TokenBasis) => wordTypes.includes(token.type as any);

export type WordToken =
  | URW
  | RW
  ;

export interface URW extends TokenBasis {
  type: 'urw';
  word: string;
}

export interface RW extends TokenBasis {
  type: 'rw';
  word: string;
  wordId: string;
}

//#endregion Word

export type PathToken = {
  type: '/';
  children: Singleton[];
}

export type LabelingToken = {
  type: '.';
  children: Singleton[];
}

export const isSingleton = (token: TokenBasis) => true;
export type Singleton = 
  | WordToken
  | PathToken
  | LabelingToken
  ;

export type Conjunction = {
  type: ' ';
  children: Singleton[];
}

export type Disjunction = {
  type: '|';
  children: (Singleton|Conjunction)[];
}

export type Token = URW | RW | PathToken | LabelingToken | Conjunction | Disjunction;

export type LazyFetch<T> = undefined | null | T | Promise<T>;

export type WordResolution = {
  wordId: string;
  path: LazyFetch<string[]>;
  labels: LazyFetch<string[]>;
}