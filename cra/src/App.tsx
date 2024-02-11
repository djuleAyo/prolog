import './App.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useKeybinds } from './hooks/useKeybinds';
import { InvisibleInput, Suggestion } from './docsierra/components';
import { Msg, WelcomeMessage } from './docsierra/messages';
import { ToastRoot } from './uiToolkit/toast';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { nextSuggestion, operatorInput, prevSuggestion, submit, suggestionSelected, textInput, unexpectedOperator, wordPromoted } from './docsierra/main.slice';
import { toTokenComponents } from './docsierra/expression';
import { FixedSizeGrid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { emojis } from './emojis';
import styled from 'styled-components';
import { useQuadSelection } from './hooks/useQuadSelection';
import { set } from 'zod';

export const post = (url: string, body: any) => {
  const base = "http://localhost:3005";
  return fetch(`${base}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then(response => {
    if (!response.ok) throw new Error(response.statusText);
    return response.json();
  })
}

let welcomeToasted = false;

function App() {
  const { searchText, suggestions, currentSuggestion, tokenPath, query, explicitOperator }
    = useAppSelector(state => state.main)

  const dispatch = useAppDispatch();

  useEffect(() => {
    setTimeout(() => {
      !welcomeToasted && (window as any).toast(WelcomeMessage)
      welcomeToasted = true
    }, 0);
  }, [])

  const [gridRef, setGridRef] = useState()
  const quad = useQuadSelection(gridRef as any)

  useEffect(() => {
    const ops = './ |'.split('')
    const op = ops.find(o => searchText.endsWith(o));
    const word = searchText.slice(0, -1);

    if (op) {
      if (!explicitOperator && query) {
        dispatch(operatorInput(' '))
      }
      if (!word && !query) {
        dispatch(unexpectedOperator())
        return 
      }
      console.log('word', word, 'op', op)
      word && dispatch(wordPromoted({ type: 'urw', word }))
      dispatch(operatorInput(op))
    }

  }, [searchText])

  const downKeybind = useCallback(() => {
    dispatch(nextSuggestion())
  }, [currentSuggestion, suggestions])

  const upKeybind = useCallback(() => {
    dispatch(prevSuggestion())
  }, [currentSuggestion, suggestions])

  const ref = useKeybinds({
    arrowdown: downKeybind,
    arrowup: upKeybind,
    ctrlenter: () => dispatch(submit()),
    tab: (e) => (e.preventDefault(), dispatch(suggestionSelected())),
  })

  const expressionTokens = !query ? null : [
    ...toTokenComponents(query),
    ...(explicitOperator ? [explicitOperator] : [])
  ];

  return (
    <>
      <ToastRoot />
      {expressionTokens}
      <form ref={r => {
        ref.current = r
        if (!r) return
        r.querySelector('input')?.focus()
      }} onSubmit={(e) => e.preventDefault()} >
        <InvisibleInput type="text" placeholder="🔎"
          onChange={(e) => dispatch(textInput(e.target.value))}
          value={searchText}
        />
      </form>
      {/* JSON.stringify(tokenPath) */}
      {suggestions.map((s, i) =>
        <Suggestion current={currentSuggestion === i}>
          {!(s as any).decomposition
            ? s.wordId
            : toParts((s as any).phrase, (s as any).decomposition, (s as any).matchIndexes)
          }
        </Suggestion>
      )}
      {quad}
      <AutoSizer>
        {({ height, width }: { height: number, width: number }) => 
          <FixedSizeGrid
            outerRef={r => setGridRef(r)}
            columnCount={Math.floor(width / 50)}
            rowCount={emojis.length / Math.floor(width / 50)}
            rowHeight={50}
            columnWidth={50}
            height={height}
            width={width}
          >
            {({ columnIndex, rowIndex, style }: any) => 
              <Emoji {...{ style }}>{emojis[rowIndex * (Math.floor(width / 50)) + columnIndex]}</Emoji>
            }
          </FixedSizeGrid>
        }
      </AutoSizer>
      {/* <pre>{yaml.stringify(query)}</pre> */}
    </>
  );
}

const Emoji = styled.span<{
  selected?: boolean
}>`
  width: 50px;
  height: 50px;
  display: inline-grid;
  place-items: center;
  place-content: center;
  transition: opacity 0.2s;
  opacity: 0.5;

  ${props => props.selected && `
    opacity: 1;
  `}

  &:hover {
    opacity: 1;
  }

`;

const toParts = (str: string, decomposition: string[], matchIndexes: number[]) => {
  const parts = [] as JSX.Element[];
  let last = 0;
  console.log(decomposition, matchIndexes, str)
  for (let i = 0; i < matchIndexes.length; i++) {
    const matchIndex = matchIndexes[i];
    parts.push(<span>{str.slice(last, matchIndex)}</span>);
    parts.push(<strong className="error">{decomposition[i]}</strong>);
    last = matchIndex + decomposition[i].length;
  }
  parts.push(<span>{str.slice(last)}</span>);
  console.log(parts)
  return parts;
}

export default App;
