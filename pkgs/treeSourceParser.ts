import { cl } from "./lang";
import { treeNode } from "./treeNode";

type Token = {
  lNo: number;
  content: string;
  indent: string;
}

const getIndentLength = (tokens: Token[]) => {
  if (tokens.every(t => t.indent === '')) return 2;
  const indentedTokens = tokens.filter(t => t.indent !== '');
  const indents = new Set(indentedTokens.map(t => t.indent)).values();
  const indent = Array.from(indents).reduce((acc, i) => acc.length > i.length ? i : acc);

  return indent.length;
}

const getIsConsistentIndentLength = (tokens: Token[]) => {
  const indentLength = getIndentLength(tokens);
  const lengths = new Set(tokens.map(t => t.indent.length)).values();

  return Array.from(lengths).every(l => l % indentLength === 0);
}

const assertConsistentIndentLength = (tokens: Token[]) => {
  const isIndentLengthConsistent = getIsConsistentIndentLength(tokens);

  if (!isIndentLengthConsistent)
    throw new Error('Error: Inconsistent indent length. Use only one indent length.');
}

const getIsConsistentIndentMode = (tokens: Token[]) =>
  tokens.every(t => !!/^\t*$/.exec(t.indent))
    || tokens.every(t => !!/^ *$/.exec(t.indent));

const getIndentMode = (tokens: Token[]) => 
  tokens.find(t => t.indent.length > 0)?.indent[0] === '\t' ? 'tab' : 'space';

const assertConsistentIndentMode = (tokens: Token[]) => {
  const isIndentConsistent = getIsConsistentIndentMode(tokens);

  if (!isIndentConsistent)
    throw new Error('Error: Inconsistent indent. Use either tabs or spaces.');  
}

const tokenize = (src: string) => {
  const lines = src.split('\n');

  const tokens = lines.map((l, i) => {
    const match = /^(?<indent>\s*)(?<capture>.*)$/.exec(l);
    const isEmptyLine = match?.groups!.capture === '';

    if (!match || isEmptyLine) return undefined;
    
    return { 
      lNo: i + 1, 
      content: l.trim(), 
      indent: match.groups!.indent };
  }).filter(x => x) as Token[];

  return tokens;
}

const constructTree = (tokens: Token[]) => {
  const indentLength = getIndentLength(tokens);

  const tree = treeNode(tokens[0].content);
  let stack = [tree];
  let parentLevel = 0;

  for (const token of tokens.slice(1)) {
    const { indent, content } = token;
    const level = indent.length / indentLength;
    const parent = stack[stack.length - 1];

    const node = treeNode(content);

    if (level === parentLevel + 1) { //child
      parent.children.push(node);
      continue;
    }

    if (level === parentLevel + 2) { //push
      const newParent = parent.children[parent.children.length - 1]
      stack.push(newParent);
      newParent.children.push(node);
      parentLevel++;
      continue;
    }

    if (level <= parentLevel) { //pop
      const popCount = parentLevel - level + 1;
      repeat(popCount, () => stack.pop());
      const newParent = stack[stack.length - 1];
      newParent.children.push(node);
      parentLevel = level - 1;
      continue;
    }
  }

  return tree;
}

export const parseTreeSource = (src: string) => {
  const tokens = tokenize(src);

  // validate input
  assertConsistentIndentMode(tokens);
  assertConsistentIndentLength(tokens);

  if (tokens.filter(t => !t.indent.length).length > 1) {
    //navigate multiple roots
    const tokenGroups = tokens.reduce((acc, t) => {
      if (!t.indent.length) {
        acc.push([t]);
        return acc;
      }

      acc[acc.length - 1].push(t);
      return acc;
    }, [] as Token[][]);

    const trees = tokenGroups.map(constructTree);

    const newRoot = treeNode('__tree_bind');
    newRoot.children = trees;

    return newRoot;
  }
  
  return constructTree(tokens);
}

const repeat = (count: number, fn: Function) => {
  for (let i = 0; i < count; i++) fn();
}
