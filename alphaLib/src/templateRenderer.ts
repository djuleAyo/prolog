import { cl } from '../../pkgs/lang';
import { compile } from './compiler';
import { plAll, queryVars } from './pl';
import { parseTreeSource } from '../../pkgs/treeSourceParser';
import { TreeNode } from '../../pkgs/treeNode';
import { promises as fs } from 'fs';
import Handlebars from 'handlebars';
import path from 'path';

const examleQuery =
`model: son(M, model)
  field: son(F, model)
    mark: nonImplicitMark(Mark, field)
      root: root(mark, R)
`


const query = (q: string) => {
  const res = parseTreeSource(q)
  const queryRes = queryNode(res, {})
  return queryRes
}

const parseNode = (l: string) => {
  const label = l.trim().slice(0, l.trim().indexOf(':'))
  const plQuery = l.trim().slice(l.trim().indexOf(':') + 1).trim()

  return { label, plQuery }
}

const uninitialized = (vars: Record<string, string>, query: string) => {
  return queryVars(query).filter(v => !(v in vars))
}

const queryNode = (n: TreeNode<any>, vars: Record<string, string>) => {
  const { label, plQuery } = parseNode(n.data)
  const concretized = applyVars(plQuery, vars)
  const uninit = uninitialized(vars, concretized)
  let res = plAll`${concretized}`

  if (res && res.length === 1) return res[0]

  if (n.children.length === 0) return res

  res = (res instanceof Array ? res : [res]).map(r => {
    const val = {
      _: r
    } as Record<string, any>
    for (const c of n.children) {
      const { label: cLabel, plQuery: cPlQuery } = parseNode(c.data)
      const cRes = queryNode(c, { ...vars, ...{[label]: r} })
      val[cLabel] = cRes
    }
    return val
  }) as any
  return res
}

const applyVars = (plQuery: string, vars: Record<string, string>) => {
  for (const [key, value] of Object.entries(vars)) {
    plQuery = plQuery.replace(new RegExp(`\\b${key}\\b`), value)
  }
  return plQuery
}

export const render = async (templatePath: string, alphaPath: string) => {
  await compile(alphaPath)

  const templateSource = await fs.readFile(templatePath, 'utf-8');
  const template = Handlebars.compile(templateSource)
  const valSource = await fs.readFile(templatePath.replace('.handlebars', '.vals'), 'utf-8');
  const vals = query(valSource)

  const helpersPath = `../gens/${path.basename(templatePath.replace('.handlebars', ''))}`
  cl('loading helpers', helpersPath)
  const helpers = (await import(helpersPath)).default;
  helpers(Handlebars);

  const redered = template({model: vals})
  cl('redered', redered)
}

;(async () => {
  await render("alphaLib/gens/prisma.handlebars", "loginService/alphaSource/login.alpha")
})()
