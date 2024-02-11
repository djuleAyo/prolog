import { cl, cw } from "../../pkgs/lang";
import { unique } from "../../pkgs/array";
import { exec } from "child_process";
import { promises as fs } from "fs";

export const swipl = require('swipl')

const log = true;

exec('touch dbDump');

(async () => {
  //load dbDump
  const dbDump = (await fs.readFile('./dbDump', 'utf-8')).split('\n')
  for (const line of dbDump)
    if (line) swipl.call(line)
})()

export const queryVars = (query: string) => {
  return [...query.matchAll(/\b([A-Z]\w*)\b/g)].map(m => m[1])
}

const unpackList = (list: Object) => {
  const { head, tail } = list as any
  if (tail === '[]') return [head]
  return [head, ...unpackList(tail)]
}

const formatResponse = (res: any, vars: string[]) => {
  if (vars.length === 1) res = res.map(r => r[vars[0]])
  res = unique(res)
  if (res.length === 1) res = res[0]
  if (!(res instanceof Array) && typeof res === 'object' && vars.length === 1 && !('head' in res)) res = res[vars[0]]
  if ('head' in res) res = unpackList(res)
  return res
}

export const pl = (strings: TemplateStringsArray, ...values: any[]) => {
  const query = strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
  log && cl(query.replace('assertz(', '+').replace(').', ''));
  console.log(`echo "${query}" >> dbDump`)
  query.includes('assertz') && exec(`echo "${query}" >> dbDump`)
  try {
    const res = swipl.call(query)
    const vars = queryVars(query)
    return formatResponse(res, vars)
  } catch (error) {
    return undefined
  }
};

export const plAll = (strings: TemplateStringsArray, ...values: any[]) => {
  const query = strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
  const time = Date.now()
  let solutions = [] as any[]
  const q = new swipl.Query(query);
  console.log(`echo "${query}" >> dbDump`)
  query.includes('assertz') && exec(`echo "${query}" >> dbDump`)
  let solution = null
  while (solution = q.next()) {
    solutions.push(solution);
  }
  //log && cl('solutions', solutions)
  q.close()
  const vars = queryVars(query)
  const fmt = formatResponse(solutions, vars)
  log && cl(query, new Date().getTime() - time, fmt)
  return fmt
}
