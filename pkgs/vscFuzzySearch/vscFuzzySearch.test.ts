import { promises as fs } from 'fs'
import { search } from './vscFuzzySearch';

let commands;
beforeAll(async () => {
  commands = Object.freeze({
    _: (await fs.readFile('./constants/vscodeCommands.txt', 'utf-8')).split('\n')
  })
})

describe('search', () => {
  xit('should find multiword strings matching a decomposition of the query', () => {
    
    const now = Date.now()
    const res = search('fol', commands._)

    console.log(res, Date.now() - now)
  })

  it('should find multiword strings matching a decomposition of the query', () => {
    
    console.log(search(
      'ne',
      ["Notebook: Focus Next Cell Editor"]
    ))
  })
})
