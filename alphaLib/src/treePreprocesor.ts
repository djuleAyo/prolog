import { cl } from "../../pkgs/lang"
import { emptyLineMatcher } from "./compiler"
import { LineToken, lineToken } from "./lineToken"

const isSiblingList = (line: string) =>
  !!/\s+\w+(\s+\w+)+/.exec(line)

const processSiblingListToken = (t: LineToken) => {
  const siblings = t.l.split(/\s+/).map(x => x.trim()).filter(x => x)
  const indent = /^\s*/.exec(t.l)
  const list = siblings.map((x, i) => lineToken(t.lNoOr, t.lNo + i, `${indent}${x}`))
  return list
}

export const isPath = (l: string) => !!/^\s*\w+(\/\w+)+$/.exec(l)
const pathToLines = (t: LineToken, indentLevel: string, indentStep: string) => {
  const path = t.l.split('/')
  const lines = path.map((x, i, p) => `${indentLevel}${indentStep.repeat(i)}${x.trim()}`)
  return {tokens: lines.map((l, i) => lineToken(t.lNoOr, t.lNo + i, l)),
    len: path.length
  };
}

export const treePreprocessor = (tokens: LineToken[]) => {
  //first line shouldn't be indented
  const indent = /^\s+/.exec(tokens[1].l)![0]

  // sibling lines can be mapped
  tokens = tokens.map((t) => {
    const isSiblingListLine = isSiblingList(t.l);
    if (isSiblingListLine) return processSiblingListToken(t)
    return t
  }).flat()

  // path lines change indent of the following lines
  tokens.forEach((t, i) => {
    const isPathLine = isPath(t.l);
    if (isPathLine) {
      const startIndent = /^\s*/.exec(t.l)![0];
      const {tokens: pathTokens, len} = pathToLines(t, startIndent, indent)

      const pathTokensIndented = pathTokens.map((pt, pti) =>
        ((pti > i && (pt.l =`${startIndent}${indent.repeat(pti)}${pt.l.trim()}`)), pt))
      
      const restIndented = tokens.slice(i + 1).map((rt) => {
        rt.l = `${indent.repeat(len - 1)}${rt.l}`
        return rt
      })
      tokens = [...tokens.slice(0, i), ...pathTokensIndented, ...restIndented]
   }
  })
  return tokens
}

export const isTreeSource = (lineTokens: LineToken[]) => {
  const nonIndentedLine = lineTokens[0].l.match(/^\w/);
  /* first line must not have indent */
  if (!nonIndentedLine) return false
  /* next line must have indent if not empty */
  const nextToken = lineTokens.slice(1).find((t) => !t.l.match(emptyLineMatcher))

  //todo: allow singe line trees - IE path/leaf sibling
  if (!nextToken) return false

  //very rudimentary check for quick exit - more important to determin if it is not a tree
  if (nextToken!.l.match(/^\s/)) return true
  else return false
}
