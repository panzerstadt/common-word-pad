type Node<Partials extends Object> = {
  value: Partials | null;
  isWord: boolean;
  parent: Node<Partials> | null;
  children: Node<Partials>[]; // exactly 26 children,
  tagged?: any;
};

export interface OutputNode<P extends Object> extends Omit<Node<P>, "parent" | "children"> {
  parent: string;
  children: OutputNode<P>[];
}

type Compare<P> = (a: P | null, b: P | null) => boolean;
type Concat<P, V> = (partials: P[]) => V;
type Split<V, P> = (value: V) => P[];

/**
 * if we're doing an english language autocomplete,
 * the runtime complexity is O(H), where the height is
 * bound by the longest word in the english dictionary
 *
 * also if its characters, then T is string
 */
export default class Trie<Partials extends Object, Value extends Object> {
  // DoublyLinkedList backed
  private head: Node<Partials>;
  private toValue: Concat<Partials, Value> = (parts: any[]) => parts.join("") as unknown as Value; // prettier-ignore
  private toPartials: Split<Value, Partials> = (value: Value) => (value as unknown as string).split("") as unknown as Partials[]; // prettier-ignore
  private comparePartials: Compare<Partials> = (a: any, b: any) => a === b; // prettier-ignore
  private compareValues: Compare<Value> = (a: any, b: any) => a === b;

  constructor(
    comparePartials?: Compare<Partials>,
    compareValues?: Compare<Value>,
    partialsToValues?: Concat<Partials, Value>,
    valuesToPartials?: Split<Value, Partials>
  ) {
    this.head = {
      value: null,
      isWord: false,
      parent: null,
      children: [],
    };
    if (comparePartials) {
      this.comparePartials = comparePartials;
    }
    if (compareValues) {
      this.compareValues = compareValues;
    }
    if (partialsToValues) {
      this.toValue = partialsToValues;
    }
    if (valuesToPartials) {
      this.toPartials = valuesToPartials;
    }
  }

  private _replacer(key: any, value: any) {
    // Filtering out properties
    if (key === "parent") {
      return "<circular>";
    }
    return value;
  }

  toJSON() {
    const str = this.toString();
    return JSON.parse(str) as OutputNode<Partials>;
  }

  toString() {
    return JSON.stringify(this.head, this._replacer, 2);
  }

  /**
   * what we're trying to do is
   * - for every char in the arrayable item:
   * - if there is a child node for this char, move on to the next char (do nothing to it)
   * - else this char is a new child, create the node and add it to the child
   */
  insert(item: Partials[]): void {
    if (item.length === 0) return;
    let curr = this.head;
    item.forEach((c) => {
      const childIdx = curr.children.findIndex((n) => this.comparePartials(n.value, c)); // prettier-ignore
      if (childIdx !== -1) {
        curr = curr.children[childIdx];
      } else {
        // no child, make new child
        const childNode: Node<Partials> = {
          value: c,
          isWord: false,
          parent: curr,
          children: [],
        };
        curr.children.push(childNode);
        curr = childNode;
      }
    });
    curr.isWord = true;
  }
  delete(item: Value): void {
    /**
     * recursion is good here
     * - your recurse your way into the node
     * - in the post operation, you delete your way back up
     *      - only delete if you're the only link left
     */

    // recurse
    let curr = this._findOne(item, this.head, []);
    if (!curr) return;

    // 1. set isWord to false
    curr.isWord = false;
    // 2. remove nodes upward
    this._removeNode(curr);
  }

  // 2. recursively remove node upward
  private _removeNode(node: Node<Partials> | null) {
    // base case
    if (!node) return;
    if (node.isWord) return;

    // pre
    // 2.1 if has children, don't remove
    if (node.children.length > 0) return;
    // 2.2 else remove node, go to parent, repeat 2
    node = node.parent;
    if (node) {
      node.children = [];
    }

    // recurse
    this._removeNode(node);

    // post
  }
  // tag node for highlighting
  private _tagNode(node: Node<Partials> | null, keyword: Value) {
    // base case
    if (!node) return;
    // if (node.isWord) return;

    // pre
    node.tagged = keyword;
    node = node.parent;
    // recurse
    this._tagNode(node, keyword);

    // post
  }

  private _findOne(
    item: Value,
    curr: Node<Partials>,
    wordSoFar: Partials[]
  ): Node<Partials> | null {
    // base cases
    if (!this._hasPartialMatch(item, wordSoFar)) return null;

    // pre
    if (curr.value) {
      wordSoFar.push(curr.value);
    }
    if (curr.isWord && this._matches(item, wordSoFar)) {
      return curr;
    }
    // recurse
    for (const child of curr.children) {
      const res = this._findOne(item, child, [...wordSoFar]);
      if (res) return res;
    }

    // post
    return null;
  }

  private _matches(search: Value, wordSoFar: Partials[]) {
    return this.compareValues(search, this.toValue(wordSoFar));
  }

  find(partial: Value): Value[] {
    const result: Value[] = [];
    // reset tags

    if (!partial) return result;
    // this is just a dfs
    let curr = this.head;
    if (!curr) return [];

    this._find(partial, curr, [], result);

    return result;
  }

  private _find(search: Value, curr: Node<Partials>, wordSoFar: Partials[], results: Value[]) {
    // base cases
    if (!this._hasPartialMatch(search, wordSoFar)) return;

    // pre
    if (curr.value) {
      wordSoFar.push(curr.value);
    }
    if (curr.isWord && this._hasPartialMatch(search, wordSoFar)) {
      results.push(this.toValue(wordSoFar));
      this._tagNode(curr, search);
    }
    // recurse
    curr.children.forEach((c) => {
      // important to pass in a new copy of words so far,
      // otherwise different branches mutate the same partials array
      this._find(search, c, [...wordSoFar], results);
    });

    // post

    // because partial match searchTerms that are longer
    // than the result, we clean that up here by
    // removing items where search term is longer than result
    const badIdxs: number[] = [];
    results.forEach((res, idx) => {
      if (this.toPartials(search).length > this.toPartials(res).length) {
        badIdxs.push(idx);
      }
    });

    for (let i = results.length - 1; i >= 0; i--) {
      if (badIdxs.includes(i)) {
        results.splice(i, 1);
      }
    }
  }

  /**
   * Checks if there is a partial match between the search value and the word constructed so far.
   * matches true even if search term is longer than the words so far
   * e.g. search:beee <-> sofar:be = true
   */
  private _hasPartialMatch(search: Value, wordSoFar: Partials[]): boolean {
    const searchPartials = this.toPartials(search);
    for (const sIdx in searchPartials) {
      const searchChar = searchPartials[sIdx];
      const wordSoFarChar = wordSoFar[sIdx];
      if (!wordSoFarChar) break;
      // the partial search no longer matches the word constructed so far
      if (!this.comparePartials(searchChar, wordSoFarChar)) return false;
    }
    return true;
  }
}
