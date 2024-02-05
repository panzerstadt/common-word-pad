import { useEffect, useState } from "react";
import { useAutoComplete } from "./useAutoComplete";
import { GraphData } from "./dictionary";
import { given } from "flooent";

interface Props {
  onUpdate?: (graph: GraphData) => void;
}
export const AutoCompleteNotepad: React.FC<Props> = ({ onUpdate }) => {
  const [isBusy, setIsBusy] = useState(false);
  const [input, setInput] = useState("");
  const [tempInput, setTempInput] = useState("");

  const [results, graph, { handleSearch: setAutocompleteInput, handleLoadDictionary }] =
    useAutoComplete();

  const isValid = tempInput !== "" && !!tempInput && results.length === 0;

  useEffect(() => {
    // TODO: load entire corpus. WARNING: very heavy. needs performance improvements
    const COMMON_WORDS_1K = "1k.txt";
    fetch("/words/" + COMMON_WORDS_1K)
      .then((res) => res.text())
      .then((res) => {
        const all = res.split("\n");

        const wordsSubset = all
          //   .filter(
          //     (w) =>
          //       (w.startsWith(char) || w.startsWith(char.toUpperCase())) && w.matchAll(/[^a-zA-Z]/g)
          //   )
          .slice(0, 100);

        handleLoadDictionary(wordsSubset);
      });
  }, []);

  useEffect(() => {
    if (isValid) return;
    graph && onUpdate?.(graph);
  }, [graph, isValid]);

  const handleStartInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isBusy) return; // FIXME: this is a shitty impl, cause we lose user input when user types too fast and trie can't catch up
    // better solutionmight be to use a Queue for user inputs, and process them one by one as they come in
    const val = e.target.value;
    if (val === "") {
      setInput("");
      setTempInput("");
      setAutocompleteInput("");
      return;
    }

    // get latest word to autocomplete, separate by whitespace
    const latestPartialWord = given.string(val).afterLast(" ").toString();
    console.log(`partial word: <<${latestPartialWord}>>`);

    setTempInput(val);
    setIsBusy(true);
    setAutocompleteInput(latestPartialWord);
  };

  const handleFinishInput = () => {
    setInput(tempInput);
    setIsBusy(false);
  };

  const handleNextWord = (e: React.KeyboardEvent) => {
    if (e.code === "Space") {
      setTempInput("");
      setAutocompleteInput("");
      setInput(input + " ");
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (results.length > 0) {
      handleFinishInput();
    }
  }, [results]);

  return (
    <div className="fixed top-0 left-0 w-full px-8 pt-10 z-50 flex md:flex-row flex-col gap-2 items-start">
      <div className="max-w-lg w-full">
        <div className="flex gap-2 relative w-full border-2 border-sky-500 rounded-md focus-within:outline outline-2 outline-sky-500">
          <textarea
            rows={10}
            className="py-2 px-4 w-full bg-slate-50 rounded-md text-xl font-light focus:outline-none"
            placeholder="try typing a sentence"
            value={input}
            onChange={handleStartInput}
            onKeyDownCapture={handleNextWord}
          />
        </div>
        <SearchResults data={results} />
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
