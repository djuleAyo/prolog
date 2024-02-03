father(F, S) :- son(S, F).

ancestor(A, D) :- father(A, D).
ancestor(A, D) :- father(A, X), A \= X, ancestor(X, D).

descendant(D, A) :- ancestor(A, D).

root(R) :- \+ father(_, R).
root(N, N) :- root(N).
root(N, R) :- ancestor(R, N), root(R).

leaf(L) :- \+ father(L, _).
leaf(N, N) :- leaf(N).
leaf(N, L) :- ancestor(N, L), leaf(L).

dfs(N, [N]) :- leaf(N).
dfs(N, [N|T]) :- father(N, X), dfs(X, T).

tree(N, Paths) :- findall(Path, dfs(N, Path), Paths).

treeNode(N) :- son(_, N); father(_, N).

mark(N, N) :- treeNode(N).
mark(M, N) :- ancestor(M, N).
mark(M, N) :- label(M, N).
mark(M, N) :- label(M, A), ancestor(A, N).

nonImplicitMark(M, N) :- mark(M, N), \+ ancestor(M, N), \+ M == N.

inductiveMark(M, N) :-
  (son(N, _) ; son(_, N)),
  descendant(D, N), mark(M, D),
  \+ son(M, N),
  \+ mark(M, N),
  \+ (descendant(X, N), \+ mark(M, X))
.

ancestors(N, []) :- root(N).
ancestors(N, [F | As]) :- father(F, N), ancestors(F, As).

path(N, R) :- reverse([N | As], R), ancestors(N, As), !.
