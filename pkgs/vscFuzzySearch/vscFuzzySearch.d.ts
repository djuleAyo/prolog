type Part = string;
type Decomposition = Part[];
type Match = {
    index: number;
    matchIndexes: number[];
    decomposition: Decomposition;
};
export declare function search(query: string, searchSpace: string[]): Array<Match>;
export {};
