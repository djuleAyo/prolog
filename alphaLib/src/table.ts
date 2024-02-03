/* export const toPl = (table: string[][]) => {
  const labelTypes = table[0]

  let entries = '';

  labelTypes.forEach((lt, lti) => {
    if (lti === 0) return
    table.slice(1).forEach((row, ri) => {
      const obj = row[0]
      const label = row[lti]
      if (!label) return
      entries += `label('${label}', '${obj}').\n`
    });
  });
  return entries;
} */

const separatorLine = (colLens: number[], char: String) =>
  colLens.map(l => char.repeat(l)).join(' ');

const printInSpace = (colLens: number[], vals: string[]) =>
  vals.map((v, i) => `${v}${' '.repeat(colLens[i] - v.length)}`).join(' ');

/** Collects expectations and creates a table */
export const toEmptyTable = (labelTypes: string[], objects: string[]) => {
  const withDefault = [...labelTypes, 'other']
  const colLens = withDefault.map(lt => lt.length)
  colLens[0] = objects.reduce((acc, cur) => cur.length > acc ? cur.length : acc, colLens[0])

  let table = '';
  table += separatorLine(colLens, '=') + '\n'
  table += printInSpace(colLens, withDefault) + '\n'
  table += separatorLine(colLens, '-') + '\n'
  objects.forEach(ol => {
    table += ol + '\n'
  })    
  table += separatorLine(colLens, '=') + '\n'
  return table
}
