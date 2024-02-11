import { cl } from "../../pkgs/lang"
import { chunkToSource } from "./compiler"
import { toLineTokens } from "./fileUtil"

const include = require('./fileUtil').include
const fs = require('fs').promises

const sourceFile = 
`
before include
include inclusionFile.test
after include
`

const includedFile = 
`
this is included
from another file
`

const expected = 
`
before include

this is included
from another file

after include
`


const deepSource = 
`deep source 0
include deep1.test
deep source 2
`
const deep1 = 
`deep1 0
include deep2.test
deep1 2
`
const deep2 = 
`deep2 0
deep2 1
`
const deepExpected =
`deep source 0
deep1 0
deep2 0
deep2 1

deep1 2

deep source 2
`
beforeEach(() => {
  console.log('before each')
})
describe('include', () => {
  it('should include a file by copy paste it in place of include line', async () => {
    await fs.writeFile('inclusionFile.test', includedFile)

    const buf = {lines: toLineTokens(sourceFile)}
    const resBuf = await include(buf)

    await fs.unlink('inclusionFile.test')

    const res = chunkToSource(resBuf.lines)
    expect(res).toBe(expected)
  })
  it('should update line numbers', async () => {
    await fs.writeFile('inclusionFile.test', includedFile)

    const buf = {lines: toLineTokens(sourceFile)}
    const resBuf = await include(buf)

    await fs.unlink('inclusionFile.test')

    const lNoOr = resBuf.lines.map(l => l.lNoOr)
    const lNo = resBuf.lines.map(l => l.lNo)
    
    expect(lNoOr).toEqual([0, 1, 2, 2, 2, 2, 3, 4])
    expect(lNo).toEqual([0, 1, 0, 1, 2, 3, 3, 4])

  });

  it('should import library files', () => {
    
  })

  it('should not work for deep includes', async () => {
  })
});
