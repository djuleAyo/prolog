import { ReactElement } from "react"
import { Token as Token_t } from "./shared"
import { Token } from "./components"

const zipWith = (a: any[], char: string) =>
  a.map((e, i) => [e, char]).flat();

export const toTokenComponents = (token: Token_t | string): ReactElement[] => {
  if (!token) return []

  if (typeof token === 'string') {
    return [<strong>{token}</strong>]
  }
  if (token.type === 'urw') {
    return [<Token unresolved>{token.word}</Token>]
  } else if (token.type === 'rw') {
    return [<Token resolved>{token.word}</Token>]
  } else if (token.type === '/') {
    const res =  zipWith(token.children, '/').map(toTokenComponents) as any
    return res.flat().slice(0, -1)
  } else if (token.type === '.') {
    const res = zipWith(token.children, '.').map(toTokenComponents) as any
    return res.flat().slice(0, -1)
  } else if (token.type === ' ') {
    return zipWith(token.children, ' ').map(toTokenComponents).flat().slice(0, -1)
  } else if (token.type === '|') {
    let res = zipWith(token.children, ' | ').map(toTokenComponents)
    return res.flat().slice(0, -1)
  }

  return []

}