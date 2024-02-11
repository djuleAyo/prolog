//define symbol to signal end of word
type TrieState = Record<string, any>

export class Trie {
  public tree = {} as TrieState

  add(str: string) {
    let curState = this.tree;
    str.split('').forEach((c, i) => {
      if (c in curState) curState = curState[c];
      else curState = curState[c] = {endOfWord: false};
      if (i === str.length - 1) curState.endOfWord = true;
    })
  }

  solutions(str: string) {
    const curState = this.state(str)
    if (!curState) return []
    const sols = [] as string[]
    const dfs = (state: TrieState, str: string) => {
      if (state.endOfWord) sols.push(str)
      for (const [key, value] of Object.entries(state).filter(([key]) => key.length ===1 ))
        dfs(value, str + key)
    }
    dfs(curState, str)
    return sols
  }

  state(word: string) {
    let curState = this.tree;
    for (const c of word) {
      if (c in curState) curState = curState[c];
      else return undefined
    }
    return curState
  }

  remove(str: string) {
    const curState = this.state(str)
    if (!curState) return false
    curState.endOfWord = false
    return true
  }
}
