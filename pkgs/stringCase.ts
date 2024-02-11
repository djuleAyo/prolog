const capitalize = (str: string) => str[0].toUpperCase() + str.slice(1);

const stringCases = [
  'camelCase',
  'PascalCase',
  'snake_case',
  'kebab-case',
  'space case',
] as const;

type StringCase = typeof stringCases[number];

/* const lc = '[a-z]';
const uc = '[A-Z]'; */

/** international lower case */
export const lc = /[\p{Ll}\p{Nd}_]/u.source;
/**
 * international upper case
 */
export const uc = /[\p{Lu}\p{Nd}_]/u.source;

const re = (str: string, mode?: string) => new RegExp(`${str}`, mode);

const matchers: Record<StringCase, RegExp> = {
  'camelCase': re(`^${lc}+(${uc}${lc}*)*$`, 'u'),
  'PascalCase': re(`^${uc}${lc}*(${uc}${lc}*)*$`, 'u'),
  'snake_case': re(`^${lc}+(_${lc}+)*$`, 'u'),
  'kebab-case': re(`^${lc}+(-${lc}+)*$`, 'u'),
  'space case': re(`^${lc}+( ${lc}+)*$`, 'u'),
}

export const detectCase = (str: string): StringCase | undefined => {
  for (const stringCase of stringCases) {
    if (matchers[stringCase].exec(str)) return stringCase;
  }
  return undefined;
}

const normalize: Record<StringCase, (str: string) => string> = {
  'camelCase': (str: string) => str.split(/.{0}(?=[A-Z])/).map(x => x.toLowerCase()).join(' '),
  'PascalCase': (str: string) => str.split(/.{0}(?=[A-Z])/).filter(x => x).map(x => x.toLowerCase()).join(' '),
  'snake_case': (str: string) => str.split('_').join(' '),
  'kebab-case': (str: string) => str.split('-').join(' '),
  'space case': (str: string) => str,
};

const spaceToCase: Record<StringCase, (str: string) => string> = {
  'camelCase': (str: string) => str.split(' ').map((x, i) => i === 0 ? x : capitalize(x)).join(''),
  'PascalCase': (str: string) => str.split(' ').map(x => capitalize(x)).join(''),
  'snake_case': (str: string) => str.split(' ').join('_'),
  'kebab-case': (str: string) => str.split(' ').join('-'),
  'space case': (str: string) => str
}

export const toCase = (str: string, stringCase: StringCase) => {
  const detectedCase = detectCase(str);
  if (stringCase === detectedCase) return str;
  if (!detectedCase) return str;
  const normalized = normalize[detectedCase](str);

  return spaceToCase[stringCase](normalized);
}
