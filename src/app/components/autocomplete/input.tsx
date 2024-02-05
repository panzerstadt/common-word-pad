import { useEffect, useState } from "react";
import { useAutoComplete } from "./useAutoComplete";
import { GraphData } from "./dictionary";

interface Props {
  onUpdate?: (graph: GraphData) => void;
}
export const AutocompleteInput: React.FC<Props> = ({ onUpdate }) => {
  const [input, setInput] = useState("");
  const [char, setChar] = useState("");

  const [results, graph, { handleSearch: setPartialInput, handleLoadDictionary }] =
    useAutoComplete();

  useEffect(() => {
    if (!char) return;
    const COMMON_WORDS_1K = "1k.txt";
    fetch("/words/" + COMMON_WORDS_1K)
      .then((res) => res.text())
      .then((res) => {
        const all = res.split("\n");

        const letterASubset = all
          .filter(
            (w) =>
              (w.startsWith(char) || w.startsWith(char.toUpperCase())) && w.matchAll(/[^a-zA-Z]/g)
          )
          .slice(0, 30);

        handleLoadDictionary(letterASubset);
      });
  }, [char]);

  useEffect(() => {
    graph && onUpdate?.(graph);
  }, [graph]);

  const handleSetInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setPartialInput(e.target.value);
  };
  return (
    <div className="fixed top-0 left-0 w-full px-8 pt-10 z-50 flex md:flex-row flex-col gap-2 items-start">
      <div className="max-w-lg w-full">
        <div className="flex gap-2 relative w-full border-2 border-sky-500 rounded-md focus-within:outline outline-2 outline-sky-500">
          <input
            className="py-2 px-4 w-full bg-slate-50 rounded-md text-xl font-light focus:outline-none"
            type="text"
            placeholder="try typing a sentence"
            value={input}
            onChange={handleSetInput}
          />
        </div>
        <SearchResults data={results} />
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={() => setChar("a")} className="bg-slate-800 text-white px-3 rounded-lg">
          A
        </button>
        <button onClick={() => setChar("b")} className="bg-slate-800 text-white px-3 rounded-lg">
          B
        </button>
        <button onClick={() => setChar("c")} className="bg-slate-800 text-white px-3 rounded-lg">
          C
        </button>
        <button onClick={() => setChar("d")} className="bg-slate-800 text-white px-3 rounded-lg">
          D
        </button>
        <button onClick={() => setChar("e")} className="bg-slate-800 text-white px-3 rounded-lg">
          E
        </button>
      </div>
    </div>
  );
};

const SearchResults: React.FC<{ data: string[] }> = ({ data }) => {
  return (
    <div className="-mt-1 bg-white bg-opacity-60 border-l border-b border-r rounded-b-lg">
      <div className="divide-y max-h-48 overflow-y-auto">
        {data?.map((s, i) => {
          const toGoogle = `https://www.google.com/search?q=${s}`;
          const toWiki = `https://en.wikipedia.org/wiki/${s}`;
          return (
            <a
              key={i}
              className="w-full h-full block first:mt-1"
              target="_blank"
              href={s[0] === s[0].toUpperCase() ? toWiki : toGoogle}
            >
              <p className="pl-2 py-1 hover:text-sky-600 hover:bg-slate-100 text-sm font-semibold text-slate-600">
                {s}
              </p>
            </a>
          );
        })}
      </div>
    </div>
  );
};
