
type Part = string;
type Decomposition = Part[];
type Match = {
  index: number
  matchIndexes: number[]
  decomposition: Decomposition
}

export function search(query: string, searchSpace: string[]): Array<Match> {
  if (!query) return [];

  const matcher = new RegExp(`\\b${query[0]}`, 'i')
  let remainingSearchSpace = searchSpace
    .reduce((acc, cur, i) => {
      const match = matcher.exec(cur)
      if (!match) return acc;
      acc.push({
        index: i,
        matchIndexes: [match.index],
        decomposition: [query[0]]
      });
      return acc;
    }, [] as Match[])
  if (!remainingSearchSpace.length) return [];

  let acceptedDecompositions = [[[query[0]], remainingSearchSpace]] as [string[], Match[]][];

  const buildRegex = (decomposition: string[]) =>
    new RegExp(decomposition.map(x => `\\b${x}`).join('.*'), 'i')

  for (const letter of query.slice(1)) {
    const newDecompositions = [] as [Decomposition, Match[]][];
    for (const [decomposition, searchSpaceRemainder] of acceptedDecompositions) {

      const checkDecomposition = (decomp: string[]) => {
        const regex = new RegExp(buildRegex(decomp));
        const copy =  searchSpaceRemainder
        .map(x => ({
          ...x,
          matchIndexes: [...x.matchIndexes],
        }))
        const matches = copy
        .filter(x => {
          const match = regex.test(searchSpace[x.index])
          if (!match) return false;
          const newMatcher = new RegExp(`\\b${decomp.at(-1)}`, 'i')
          const newMatch = newMatcher.exec(searchSpace[x.index])!
          if (decomp.length > x.matchIndexes.length) {
            x.matchIndexes.push(newMatch!.index)
          } else {
            x.matchIndexes[x.matchIndexes.length - 1] = newMatch!.index
          }
          return true;
        })
        console.log(decomp, matches.length, matches)
        if (matches.length) {
          newDecompositions.push([decomp, matches] as [string[], Match[]]);
        }
      }

      checkDecomposition([...decomposition.slice(0, -1), decomposition.at(-1) + letter]);
      checkDecomposition([...decomposition, letter]);
    }
    if (!newDecompositions.length) return [];
    acceptedDecompositions = newDecompositions;
  }

  console.log(JSON.stringify(acceptedDecompositions, null, 2))

  return acceptedDecompositions
    .map(([decomposition, matches]) => {
      return matches.map(match => ({
        ...match,
        decomposition
      }))
    }).flat()
}
