import { promises as fs } from 'fs'
import { parseTreeSource } from '../../pkgs/treeSourceParser'
import { TreeNode } from '../../pkgs/treeNode'
import { isPath, isTreeSource, treePreprocessor } from './treePreprocesor'
import { include, toLineTokens } from './fileUtil'
import { Err, cl, $ } from '../../pkgs/lang'
import { LineToken } from './lineToken'
import { getLine } from '../../pkgs/string'
import conf from './conf';
import { pl, plAll } from './pl'
import { newWordEntry, wordIdMap } from './write'

let inputFile : string;

export type Source = {
  lines: LineToken[];
};


const parseTreeLine = (line: string) => {
  const match = /(?<word>\w+)(?<labels>\..+)?/.exec(line);
  if (!match) throw new Error('Invalid tree node data');
  const { word, labels } = match.groups!;
  const labelList = (labels || '').split('.').filter(x => x);
  return { word, labelList };
}

const memTreeToPl = (tree: TreeNode<string>) => {
  const oneTreeToPl = (tree: TreeNode<string>, buf: Record<string, string> = {}) => {
    tree.dfs((path, node, root) => {
      const { word } = parseTreeLine(node.data as string);
      const isNewWord = !(word in wordIdMap);

      !isNewWord && !path.length && Err(`Root words must be unique.`)

      //every tree word is new word
      const wordTranslation = newWordEntry(word)

      node.data = {
        line: node.data,
        wordId: wordTranslation.wordId,
      } as any

      //root will be added by any son
      if (!path.length) return

      const parentId = (tree.at(path.slice(0, -1))!.data as any).wordId
  
      !buf.son && (buf.son = '');
      plAll`assertz(son(${wordTranslation.wordId}, ${parentId})).`;
    })
  }
  let buf = {} as Record<string, string>

  tree.data == '__tree_bind'
    ? tree.children.map(st => oneTreeToPl(st, buf)).reduce((acc, cur) => acc + cur, '')
    : oneTreeToPl(tree, buf)

  return buf
}

export const emptyLineMatcher = /^\s*$/

//no test approved ✅
const sourceToChunks = (source: Source) => {
  const getI = (startI: number) => source.lines
    .findIndex((t, i) => i > startI && !!t.l.match(emptyLineMatcher), startI)

  const chunks = [] as LineToken[][];

  let previous = 0;
  let i = getI(0)

  while (i !== -1) {
    chunks.push(source.lines.slice(previous, i))
    previous = i + 1;
    i = getI(previous)
  }
  
  chunks.push(source.lines.slice(previous))

  return chunks.map(chunk => chunk.filter(t => !t.l.match(emptyLineMatcher)))
}
const isPLRule = (line: string) => line.includes(':-')
const isExpectation = (line: string) => line.includes('=>');

const compileTrees = async (chunks: LineToken[][]) => {
  const treeChunks = chunks.filter(x => isTreeSource(x)).map(treePreprocessor)

  const allTreeSource = treeChunks.map(chunkToSource).join('\n\n')
  const allTreePredicates = memTreeToPl(parseTreeSource(allTreeSource))

  const genFile = inputFile.replace(conf.extension, '.gen.pl')
  await fs.writeFile(genFile, allTreePredicates.son)

  //allTreePredicates.son.split('\n').filter(x => x).forEach(line => pl`assertz(${line}).`)
}

const compileRulesAndExpectations = (chunks: LineToken[][]) => {
  const ruleChunks = chunks.filter(t => {
    const line = getLine(t[0].l)
    return isPLRule(line) || !!isExpectation(line)
  });

  const rules = [] as string[], expectations = [] as string[];

  ruleChunks.forEach(chunk => {
    chunk.forEach(t => {
      const isPLRuleLine = isPLRule(t.l);
      const isExpectationLine = isExpectation(t.l);
      if (isPLRuleLine) rules.push(t.l);
      if (isExpectationLine) expectations.push(t.l);
    })
  });

  rules.forEach(rule => pl`assertz((${rule})).`)

  return {rules, expectations};
}

export const chunkToSource = (chunk: LineToken[]) => chunk.map(t => t.l).join('\n');

const commentMatcher = /(%.*$)/

const removeComments = (buf: Source) => {
  buf.lines = buf.lines.map(t => {
    const commentMatch = commentMatcher.exec(t.l);
    if (!commentMatch) return t;
    t.l = t.l.replace(commentMatch[1], '');
    return t
  })
}

const tableDecorationLineMatcher = /^(-|\s)+$/

const isTableChunk = (chunk: LineToken[]) => {
  const overline = chunk[0].l.match(tableDecorationLineMatcher);
  const underline = chunk.at(-1)!.l.match(tableDecorationLineMatcher);
  return overline && underline;
}

const readTables = async (chunks: LineToken[][]) =>
  chunks.filter(isTableChunk)
    .map(chunk => chunk.filter(t => !t.l.match(tableDecorationLineMatcher)))
    .map(chunk => chunk.map(t => t.l.trim().split(/\s+/).filter(x => x)))

const loadTable = (table: string[][]) => {
  let name = table[0][0];

  if (isPath(name)) {
    const path = name.split('/')
    
    path.forEach((gen, i, path) => {
      const next = path[i + 1]
      if (next) pl`assertz(son(${next}, ${gen}))`
    })
    name = path.at(-1)!
  }

  const x = table[0].slice(1);
  const y = table.slice(1).map(row => row[0]);

  y.forEach((yi, i) => pl`assertz(son(${yi}, ${name}))`)

  x.forEach((xi, i) => {
    y.forEach((yi, j) => {
      const value = table[j + 1][i + 1];
      if (value === undefined) return
      if (value.match(/\s*_\s*/) || yi.trim() === 'other') return
      pl`assertz(label(${value}, ${yi}))`
    })
  })
}

export const compile = async (path: string) => {
  inputFile = path;
  const sourceStr = await fs.readFile(path, 'utf8')
  const buf = {lines: toLineTokens(sourceStr)};
  await $(include, removeComments)(buf)

  let chunks = sourceToChunks(buf);
  
  //remove empty lines AFTER chunking since they are used as chunk separators
  chunks.forEach((chunk, i) => chunks[i] = chunk.filter(t => !t.l.match(emptyLineMatcher)))
  chunks = chunks.filter(chunk => chunk.length)

  pl`['alphaLib/lib/tree.pl'].`
  await compileTrees(chunks);

  const { expectations } = compileRulesAndExpectations(chunks)
  const tables = await readTables(chunks)
  tables.forEach(table => loadTable(table))
}
/* ;(async () => {
  await compile(process.argv[2])

})() */