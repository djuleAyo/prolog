import express from 'express'
import { promises as fs } from 'fs'
import { Trie } from '../pkgs/trie'

import { pl } from '../alphaLib/src/pl'
import { WordResolution } from '../cra/src/docsierra/shared'
import { Token, URW } from './shared'
import { detectCase, toCase } from '../cra/pkgs/stringCase'
import { search } from '../cra/pkgs/vscFuzzySearch'

const app = express()

let trie = new Trie() as any;
let phraseList = [] as {
  phrase: string;
  wordId: string;
}[]

(async () => {
  const commands = (await fs.readFile('./constants/vscodeCommands.txt', 'utf-8')).split('\n')
  //await compile('./alphaLib/lib/model.tnt')
  trie.tree = JSON.parse(await fs.readFile('./docsierraServer/trie.json', 'utf-8'))
  phraseList = JSON.parse(await fs.readFile('./docsierraServer/phraseList.json', 'utf-8'))
  console.log('trie loaded')

  commands.forEach(command => {
    execute({ type: 'urw', word: command })
  })
})()

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

const executeUrw = (token: URW) => {
  const { word } = token

  trie.add(word)
  const trieState = trie.state(word)
  trieState.resolutions || (trieState.resolutions = []);
  const len = trieState.resolutions.length
  const wordId = `${word}${len ? `_${len}` : ''}`
  trieState.resolutions.push({
    wordId,
    path: undefined,
    labels: undefined
  } as WordResolution)

  //const isPhrase = detectCase(word) === 'camelCase' && !!word.match(/[A-Z]/);
  //if (isPhrase) {
    //must cast to space case because of regex relying on spaces as word boundaries
    const spaceCase = toCase(word, 'space case')
    phraseList.push({ phrase: spaceCase, wordId })
  //}
  fs.writeFile('./docsierraServer/phraseList.json', JSON.stringify(phraseList))
  fs.writeFile('./docsierraServer/trie.json', JSON.stringify(trie.tree))

  return { type: 'rw', word, wordId }
}

const execute = (token: Token) => {
  if (token.type === 'urw') {
    return executeUrw(token)
  }
  if (token.type === 'rw') return token
  if (token.type === ' ') {
    return token.children.map(execute)
  }
  if (token.type === '/') {
    const resolved = token.children.map(execute)

    for(let i = 0; i < resolved.length; i++) {
      if (!resolved[i + 1]) break;
      pl`assertz(son(${resolved[i + 1].wordId}, ${resolved[i].wordId})).`
    }

    return resolved
  }
}

app.post('/add', async (req, res) => {
  const expression = req.body.expression
  const result = execute(expression)
  res.json(result)
});

app.post('/search', async (req, res) => {
  const searchText = req.body.searchText
  const solutions = trie.solutions(searchText)


  const collected = new Set<string>()
  const options = solutions.map(s => trie.state(s).resolutions)
    .map(x => x.length === 1 ? x[0] : x).flat()
  
  options.forEach(o => collected.add(o.wordId))

  const fuzzyRes = search(searchText, phraseList.map(p => p.phrase))
    .map(res => ({
      ...phraseList[res.index],
      ...res
    }))
    .filter(res => {
      if (collected.has(res.wordId)) return false
      collected.add(res.wordId)
      return true
    })

  res.json(options.concat(fuzzyRes))
})

app.listen(3005, () => {
  console.log('Server running on port 3005')
})