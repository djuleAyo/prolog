import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import mainReducer, { wordPromoted, suggestionsRecieved } from '../docsierra/main.slice';
import { call, debounce, put, select, takeEvery } from "redux-saga/effects"
import createSagaMiddleware from 'redux-saga';
import { Msg } from '../docsierra/messages';
import { post } from '../App';

function* submit() {
  const explicitOperator = (yield select((state: RootState) => state.main.explicitOperator)) as string;
  const searchText = (yield select((state: RootState) => state.main.searchText)) as string;

  if (explicitOperator && !searchText && explicitOperator !== ' ')
    return (window as any).toast(<Msg msg="Unfinished expression" type={"error"}/>);
  
  if (searchText) yield put(wordPromoted({ type: 'urw', word: searchText }))

  const expression = (yield select((state: RootState) => state.main.query)) as string;
  console.log('saga sees', expression)

  try {
    yield call(post, '/add', { expression })
    return (window as any).toast(<Msg msg="Expression executed" type={"success"}/>);
  } catch (error) {
    return (window as any).toast(<Msg msg="Network error" type={"error"}/>);
  }
}

function* unexpectedOperator() {
  (window as any).toast(
    <Msg type="error" msg={`Start an expression with a word`} />
  );
  yield put({ type: 'main/textInput', payload: '' })
}

function* suggestionSelected() {
  const {suggestions, currentSuggestion} = (yield select((state: RootState) => state.main));

  if (suggestions.length === 0) {
    return (window as any).toast(<Msg msg="No suggestions found" type={"error"}/>);
  }

  const selectedSuggestion = suggestions[currentSuggestion];
  yield put(wordPromoted({
    type: 'rw',
    word: selectedSuggestion.word,
    wordId: selectedSuggestion.wordId
  }))
}

function* textInput() {
  const searchText = (yield select((state: RootState) => state.main.searchText)) as string;

  try {
    const res = (yield call(post, '/search', { searchText } )) as Record<string, string>;
    console.log(res)
    yield put(suggestionsRecieved(res))
  } catch (error) {
    console.warn(error)
    return (window as any).toast(<Msg msg="Network error" type={"error"}/>);
  }
}

function* rootSaga(): Generator {
  yield takeEvery('*', (action: any) => {
    console.log("action", action.type);
  });
  yield debounce(300, 'main/textInput', textInput);
  yield takeEvery('main/submit', submit);
  yield takeEvery('main/suggestionSelected', suggestionSelected);
  yield takeEvery('main/unexpectedOperator', unexpectedOperator);
}

const saga = createSagaMiddleware()

export const store = configureStore({
  reducer: {
    main: mainReducer
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({
    immutableCheck: { warnAfter: 128 },
    serializableCheck: { warnAfter: 128 }
  }).concat(saga),
});

saga.run(rootSaga)

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

