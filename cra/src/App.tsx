import styled from 'styled-components';
import './App.css';
import { useCallback, useEffect, useState } from 'react';
import { useKeybinds } from './hooks/useKeybinds';
import { Singleton, WordResolution } from './docsierra/shared';
import { ToastRoot } from './uiToolkit/toast';

const InvisibleInput = styled.input`
  font-size: 1.5rem;
  border: none;
  background: transparent;
  color: white;
  width: 100%;
  &:focus {
    outline: none;
  }
`;

const useVsCodeCommands = () => {

  const [vsCodeCommands, setVsCodeCommands] = useState<string[]>([]);

  useEffect(() => {
    fetch('/constants/vscodeCommands.txt')
      .then((response) => {
        response.text()
          .then((text) => {
            const commands = text.split('\n');
            setVsCodeCommands(commands);
          })
      });
  }, [])

  return vsCodeCommands;
}

const Suggestion = styled.div<{
  current: boolean
}>`
  ${props => props.current && `
    background: rgba(255, 255, 255, 0.1);
  `}
`

const Token = styled.span<{
  unresolved?: boolean
  resolved?: boolean
}>`
  ${props => props.unresolved && `
    color: #00cc00aa;
  `}
  ${props => props.resolved && `
    color: #ccaa00d9;
  `}
  margin: 0 5px;
`
const errorPathBeggining = <div className="error">
  <h3>⚠️ Error ⚠️</h3>
  <p>Start path with a word</p>
</div>

const WelcomeMessage = <>
  <h3>Welcome to Docsierra! 👋</h3>

  <p>It was about for something entierly new</p>
</>

const post = (url: string, body: any) => {
  const base = "http://localhost:3005";
  return fetch(`${base}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
}

type Suggestion = {
  word: string
  wordId: string
  path: undefined | null | Array<string>
  labels: undefined | null | Array<string>
}

const unpackWordOptions = (w: string, options: Array<{
  path: undefined | null | Array<string>,
  labels: undefined | null | Array<string>
}>) => options.map((o, i) => ({
    word: w,
    wordId: `${w}${i !== 0 ? `_${i}` : ''}`,
    path: "path" in o ? o.path : undefined,
    labels: "labels" in o ? o.labels : undefined
  } as Suggestion))

function App() {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<{
    word: string,
    wordId: string
  }[]>([]);
  const [currentSuggestion, setCurrentSuggestion] = useState<number>(0);
  const [tokenStack, setTokenStack] = useState<Singleton[]>([]);

  useEffect(() => {
    setTimeout(() => {
      (window as any).toast(WelcomeMessage)
    }, 0);
  }, [])

  useEffect(() => {
    if (!searchText) setSuggestions([]);

    post(`/search`, { searchText })
      .then((response) => {
        response.json()
          .then((data) => {
            const suggestions = Object.keys(data)
              .map(w => unpackWordOptions(w, data[w]))
              .flat()
            setSuggestions(suggestions)
          })
      })
  }, [searchText])

  useEffect(() => {
    if (suggestions.length === 0) return setCurrentSuggestion(0);
  }, [suggestions])

  const downKeybind = useCallback(() => {
    setCurrentSuggestion((currentSuggestion + 1) % suggestions.length);
  }, [currentSuggestion, suggestions])

  const upKeybind = useCallback(() => {
    //loop
    console.log('up')
    setCurrentSuggestion((currentSuggestion - 1 + suggestions.length) % suggestions.length);
  }, [currentSuggestion, suggestions])

  const onSubmit = () => {
    let searchTextToken: Singleton;
    let newTokenStack = tokenStack;

    if (searchText) {
      searchTextToken = {
        type: 'unresolved',
        word: searchText
      } as Singleton;
      newTokenStack = [...tokenStack, searchTextToken];
      setSearchText('');
    }

    if (newTokenStack.length !== 1) {
      (window as any).toast(errorPathBeggining);
      return;
    }

    post('/add', { expression: newTokenStack[0] })
      .then((response) => {
        setSearchText('');
      })
    
    setTokenStack([])
  }

  const currentSuggestionToToken = (e: any) => {
    e.preventDefault();

    if (suggestions.length === 0) return;

    const s = suggestions[currentSuggestion];
    const newTokenStack = [...tokenStack, {
      type: 'resolved',
      word: s.word,
      wordId: s.wordId,
    } as Singleton];

    setTokenStack(newTokenStack );
  }

  const slash = (e: any) => {

  }

  const ref = useKeybinds({
    arrowdown: downKeybind,
    arrowup: upKeybind,
    ctrlenter: onSubmit,
    tab: currentSuggestionToToken,
  })

  return (
    <>
      <ToastRoot />
      {tokenStack.map((t, i) =>
        <Token key={i} unresolved={t.type === 'unresolved'} resolved={t.type === 'resolved'}>
          {(t as any).word}
        </Token>)
      }
      <form ref={r => ref.current = r} onSubmit={(e) => e.preventDefault()} >
        <InvisibleInput type="text" placeholder="Search..."
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
          value={searchText}
        />
      </form>
      {suggestions.map((s, i) =>
        <Suggestion current={currentSuggestion === i}>
          {s.wordId}
        </Suggestion>)}
    </>
  );
}

interface SuggestionDistinctProps {
  wordResolution: WordResolution
}

/* const SuggestionDistinct = ({
  wordResolution
}: SuggestionDistinctProps) => {
  const r = wordResolution;
  const { word, id } = /^(?<word>[^_]+)_(?<id>\d+)$/.exec(r.wordId)!.groups as any;

  

  return <Suggestion>
    {!r.path && r.wordId}
    {r.path && }
  </Suggestion>
} */


export default App;
