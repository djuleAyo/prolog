# VSC Fuzzy

The package provides string search where query can be decomposed into multiple
parts, where each part is prefix of a word in matched string.
The words of what the package does sound complicated so let the videos speak.

**the package**

![https://imgur.com/kYZfrhL](https://i.imgur.com/kYZfrhL.gif)

**vscode**

![https://imgur.com/6L9UjP3](https://i.imgur.com/6L9UjP3.gif)

## Simplicity

No scoring functions. Simply a search resulting in matches.

```ts

type Search = (query: string, searchSpace: string[]) =>  Match[];

/** This is part of your query accepted as prefix of a word */
type Part = string;

type Decomposition = Part[];
type Match = {
  /** Results in indexes of passed searchSpace so you can map back source of the string */
  index: number
  
  /** Startig indexes of each part of decomposition in the result. 
   * These can be used as a scoring function IE  Min sum partIndexes 
   */
  partIndexes: number[]
  //from videos: "caeg" is decomposed into ["c", "a", "e", "g"]
  decomposition: Decomposition
}

//here is why indexes are returned
const myObjects = [...]

const res = search('query', myObject.map(descriptionAccessor))
```

## Alghorithm

The implementation does incremental itteration over query letters
discontinuing each decomposition that yields no results in each step of itteration.

## Roadmap - Paralelization

Future version of the packages may provide multi-core solution.
The function is easily paralelized on mulitple threads or can be sent to worker
in browser env. Natural split is in sending each decomposition to search in a thread.

## Differences

Differences in the video examples are:
* number of results
* order of results
These are due to:
* mock data being limited
* no scoring function applied to sort the results