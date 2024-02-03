import { ObjectKey } from "./objectSet";

export type O1Table = ReturnType<typeof o1Table>;

/**
 * Tabels are naturally represented as a 2D array, but we want to be able to
 * access them by row and column names. This function converts a 2D array to an
 * object of objects, where the first row is the column names, and the first
 * column is the row names.
 * 
 * Now it has constart access time and after multiple renames it ended up as
 * o1Table due to the fact that it's O(1) to access a value.
 */
export const o1Table = (table: ObjectKey[][]) => {
  const x = table[0]
  const y = table.map(row => row[0]).slice(1)

  const res = y.reduce((acc, xi) => (acc[xi] = {}, acc), {} as any);
  y.forEach((yi, i) => {
    x.forEach((xi, j) => {
      if (j === 0) return
      res[yi][xi] = table[i + 1][j]
    })
  });

  return res as { [y: string]: { [x: string]: ObjectKey } }
}
