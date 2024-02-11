import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RW, Singleton, Token, URW, lt } from "./shared";

export type Suggestion = {
  word: string
  wordId: string
  path: undefined | null | Array<string>
  labels: undefined | null | Array<string>
}

const initialState = {
  searchText: '',
  suggestions: [] as Suggestion[],
  currentSuggestion: 0,
  query: undefined as Token | undefined,
  tokenPath: [] as number[],
  explicitOperator: undefined,
} as const

const tokenAt = (ast: Token, tokenPath: number[]) => tokenPath.reduce((acc, cur) => (acc as any).children[cur] , ast)

const reduce = (state: typeof initialState , by: string) => {
  const { query: ast, tokenPath: tokenIndexPath } = state;
  const tokenStack = [ast] as Token[]
  let step = ast;

  for (let i = 0; i < tokenIndexPath.length; i++) {
    step = (step as any).children[tokenIndexPath[i]];
    tokenStack.push(step!);
  }

  let stackTop = tokenStack.at(-1)!;
  const beforeReduceLen = tokenStack.length;

  while (tokenStack.length && lt(by as any, stackTop.type)) {
    tokenStack.pop()
    stackTop = tokenStack.at(-1)!;
  }

  if (beforeReduceLen === tokenStack.length && beforeReduceLen !== 0 && stackTop!.type !== by) {
    const lastChild = (stackTop as any).children.pop()!;
    const newToken = { type: by, children: [lastChild] } as Token;
    (stackTop as any).children.push(newToken)
    state.tokenPath.push((stackTop as any).children.length - 1)
    return
  }

  if (tokenStack.length === 0) {
    (state.query as any) = { type: by, children: [ast] } as Token
    (state.tokenPath as any) = []
    return
  }
  if (stackTop.type === by) {
    //const reduced = (stackTop as any).children.pop()!;
    //(stackTop as any).children.push({ type: by, children: [reduced] } as Token)
    return
  }
  if (lt(stackTop.type, by as any)) {
    const reduced = (stackTop as any).children.pop()! as Token;
    (stackTop as any).children.push({ type: by, children: [reduced] } as Token)
    return
  }
}

const slice = createSlice({
  name: "main",
  initialState,
  reducers: {
    textInput: (state, action) => {
      if (action.payload !== ' ') state.searchText = action.payload;
    },
    operatorInput: (state, action) => {
      const { query, tokenPath } = state;
      
      state.explicitOperator = action.payload;

      reduce(state, action.payload);
      state.searchText = '';
    },
    nextSuggestion: (state) => {
      (state.currentSuggestion as any) = (state.currentSuggestion + 1) % state.suggestions.length;
    },
    prevSuggestion: (state) => {
      (state.currentSuggestion as any) = (state.currentSuggestion - 1 + state.suggestions.length) % state.suggestions.length;
    },
    suggestionSelected: (state) => {},
    wordPromoted: (state, action: PayloadAction<URW|RW>) => {
      let { query, explicitOperator, tokenPath } = state;
      state.searchText = '';

      const currentToken = tokenAt(query!, tokenPath) as any;
      console.log('currentToken', JSON.stringify(currentToken, null, 2)) 

      if (action.payload.type === 'rw') state.explicitOperator = undefined;
      if (!query) {
        state.query = action.payload;
        return
      }
      if (tokenPath.length === 0 && ['urw', 'rw'].includes(query.type)) {
        state.query = {
          type: ' ',
          children: [query as Singleton, action.payload]
        }
        return
      }
      if (explicitOperator) {
        (currentToken as any).children.push(action.payload);
        return
      } else {
        //reduce by conjunction
        reduce(state, ' ');
        (currentToken).children.push(action.payload);
      }
    },
    submit: (state) => {},
    suggestionsRecieved: (state, action) => {
      state.suggestions = action.payload;
    },
    unexpectedOperator: () => {}
  }
})

export default slice.reducer;
export const {
  textInput,
  operatorInput,
  nextSuggestion,
  prevSuggestion,
  suggestionSelected,
  wordPromoted,
  submit,
  suggestionsRecieved,
  unexpectedOperator
} = slice.actions;