export type LineToken = {
  lNoOr: number;
  lNo: number;
  l: string;
}
export const lineToken = (lNoOr: number, lNo: number, l: string): LineToken => ({lNoOr, lNo, l});