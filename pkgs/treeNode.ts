export const get = (obj: any, path: string[]) =>
  path.reduce((acc, key) => acc && acc[key] || void 0, obj);

const tabChar = "	";

const getBaseLog = (x: number, y: number) => Math.log(y) / Math.log(x);

const traversalMode = [
  "bfs",
  "dfs",
  "leaf",
  "generationUp",
  "generationDown",
] as const;
type TraversalMode = typeof traversalMode[number];

type Entry = { path: string[]; node: TreeNode<any> };
type Path = number[];
type TraversalCB = <T>(
  path: Path,
  node: TreeNode<T>,
  root: TreeNode<T>
) => void;
export class TreeNode<D, C = D> {
  public children: TreeNode<C>[] = [];

  static from(obj: Record<string, any>) {
    const root = treeNode("");
    let queue = [{ path: [], node: root }] as Entry[];

    while (queue.length) {
      const current = queue.pop() as Entry,
        currentProp = current.path.length > 0 ? get(obj, current.path) : obj;

      if (typeof currentProp === "object" && currentProp) {
        const keys = Object.keys(currentProp);
        const children = keys.map((k) => treeNode(k));
        current.node.children = children;
        queue = [
          ...children
            .map((c) => ({ path: [...current.path, c.data], node: c }))
            .reverse(),
          ...queue,
        ];
      } else {
        current.node.children = [get(obj, current.path)];
      }
    }
    return root;
  }

  constructor(public data: D) {}

  bfs(cb: TraversalCB) {}

  dfs(cb: TraversalCB) {
    const parents: { node: TreeNode<D>; at: number }[] = [
      { node: this, at: -1 },
    ];
    cb([], this, this);

    while (parents.length) {
      const parent = parents[parents.length - 1];

      if (parent.at < parent.node.children.length + 1) {
        const current = parent.node.children[++parent.at];
        if (!(current instanceof TreeNode)) {
          parents.pop();
          continue;
        }
        cb(
          parents.map((p) => p.at),
          current,
          this
        );
        parents.push({ node: current, at: -1 });
        continue;
      }

      if (parent.at === parent.node.children.length - 1) {
        parents.pop();
      }
    }
  }

  leaf(cb: TraversalCB) {}

  generationUp(cb: TraversalCB) {}

  generationDown(cb: TraversalCB) {}

  at(path: Path) {
    const p = [...path].reverse();
    let current = this;
    while (p.length) current = current.children[p.pop() as number] as any;
    return current;
  }

  atContentPath(path: string, includeRoot = true) {
    let p = path.split('.');
    if (includeRoot && p[0] !== this.data) 
      throw new Error(`Not p of this tree. Expected ${this.data} got ${p[0]}`);
    p = p.slice(includeRoot ? 1 : 0);
    p = p.reverse();
    let current = this;
    while (p.length && current) current = current.children.find(c => c.data === p.pop()) as any;
    return current;
  }

  touch(path: string, includeRoot = true) {
    let p = path.split('.');

    if (includeRoot && p[0] !== this.data)
      throw new Error(`Not p of this tree. Expected ${this.data} got ${p[0]}`);

    p = p.slice(includeRoot ? 1 : 0);

    let current = this;

    for (const nodeData of p) {
      const existingNode = current.children.find(c => c.data === nodeData);
      if (existingNode) {
        current = existingNode as any;
        continue;
      }
      const newNode = treeNode(nodeData);
      current.children.push(newNode as any);
      current = newNode as any;
    }
  }

  traverse(mode: TraversalMode, cb: TraversalCB) {
    return this[mode]!(cb);
  }

  map(arg: (d: D) => any) {
    this.dfs((path, node) => {
      node.data = arg(node.data as any)
    })
    return this;
  }

  toObject() {}
}

export const treeNode = <D>(d: D) => new TreeNode(d);