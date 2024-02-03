import express from 'express'
import { promises as fs } from 'fs'
import { Trie } from '../pkgs/trie'

import { compile } from '../alphaLib/src/compiler'
import { plAll } from '../alphaLib/src/pl'
import { isPath } from '../alphaLib/src/treePreprocesor'
import { WordResolution } from '../cra/src/docsierra/shared'

const app = express()

let trie = new Trie() as any;

(async () => {
  const commands = (await fs.readFile('./constants/vscodeCommands.txt', 'utf-8')).split('\n')
  await compile('./alphaLib/lib/model.tnt')
}) ()

//allow cors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
//logger
app.use((req, res, next) => {
  console.log(req.method, req.path)
  next()
})

app.use(express.json())

app.post('/add', async (req, res) => {
  const expression = req.body.expression
  const { word } = expression

  if (!word) res.status(400).json({ error: 'No word provided' })

  trie.add(word)
  const trieState = trie.state(word)
  trieState.resolutions || (trieState.resolutions = []);
  const len = trieState.resolutions.length
  trieState.resolutions.push({
    wordId: `${word}${len ? `_${len}` : ''}`,
    path: undefined,
    labels: undefined
  } as WordResolution)
  res.json({[word]: trieState.resolutions})
});

app.post('/search', async (req, res) => {
  const searchText = req.body.searchText
  const solutions = trie.solutions(searchText)

  const resolutions = solutions.map(s => ({[s]: trie.state(s).resolutions}))
    .reduce((acc, cur) => acc = {
      ...acc,
      ...cur
    }, {})

  res.json(resolutions)
})

app.listen(3005, () => {
  console.log('Server running on port 3005')
})