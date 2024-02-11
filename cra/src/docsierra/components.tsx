import styled from "styled-components";

export const InvisibleInput = styled.input`
  font-size: 1.5rem;
  border: none;
  background: transparent;
  color: white;
  width: 100%;
  &:focus {
    outline: none;
  }
`;

export const Suggestion = styled.div<{
  current: boolean
}>`
  ${props => props.current && `
    background: rgba(255, 255, 255, 0.1);
  `}
`

export const Token = styled.span<{
  unresolved?: boolean
  resolved?: boolean
}>`
  ${props => props.unresolved && `
    color: #00cc00aa;
  `}
  ${props => props.resolved && `
    color: #ccaa00d9;
  `}
`