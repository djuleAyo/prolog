`

-----  -----  ---  -------
this   is     an   example
-----  -----  ---  -------
hello  table
-----  -----  ---  -------

`

export const isDecorationLine = (l: string) => 
  l.match(/=+(\s+=+)/) || l.match(/\-+(\s+\-+)/)

export const parse = (src: string) =>
  src.trim().split('\n').map(x => x.trim()).filter(x => !isDecorationLine(x))
    .map(l => l.split(/\s+/))