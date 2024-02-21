import { useEffect, useRef, useState } from "react";
import { GraphData } from "./dictionary";
import { useAutoComplete } from "./useAutoComplete";
import { SearchResults } from "./SearchResults";
import { useBlink } from "./useBlink";
import { given } from "flooent";
import useDebouncedEffect from "use-debounced-effect";

interface Props {
  onUpdate?: (graph: GraphData) => void;
}

export const AutoCompleteNotepad: React.FC<Props> = ({ onUpdate }) => {
  const [content, setContent] = useState<string>("");
  const [word, setWord] = useState<string>("");
  const [warn, flashWarn] = useBlink();

  const [results, graph, { handleSearch, handleLoadDictionary }] = useAutoComplete();
  const wordBreakRegex = /[\s,.\-:]/; // supported word breaks
  const isValidWord =
    word === "" || results.find((res) => res === word.replace(wordBreakRegex, ""));

  useEffect(() => {
    const COMMON_WORDS_1K = "1k.txt";
    fetch("/words/" + COMMON_WORDS_1K)
      .then((res) => res.text())
      .then((res) => {
        const all = res.split("\n");

        const wordsSubset = all.slice(0, 200);

        handleLoadDictionary(wordsSubset);
      });
  }, []);

  useEffect(() => {
    if (!!word) {
      handleSearch(word);
    }
  }, [word]);

  useDebouncedEffect(
    () => {
      graph && onUpdate?.(graph);
    },
    300,
    [graph]
  );

  const handleType = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const valueArray = [...value];

    if (valueArray.every((v) => isAlpha(v))) {
      return setWord(value);
    }

    const lastChar = valueArray[value.length - 1];
    if (wordBreakRegex.test(lastChar) && isValidWord) {
      setContent((p) => `${p} ${value.trim()}`);
      setWord("");
      return;
    }

    flashWarn();
  };

  const handleBackspace = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && word.length === 0) {
      // load the previous word back
      const lastWord = given.string(content).afterLast(" ").toString();
      setWord(lastWord);

      // remove the last item from content
      setContent((p) => given.string(p).beforeLast(" ").toString());
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full px-8 pt-10 z-50 flex md:flex-row flex-col gap-2 items-start">
      <div className="max-w-lg w-full">
        <div className="flex gap-2 relative w-full border-2 border-sky-500 rounded-md focus-within:outline outline-2 outline-sky-500">
          <p className="py-2 px-4 w-full h-52 bg-slate-300 test-white rounded-md text-xl font-light">
            {content}{" "}
            <input
              className={`${warn ? "bg-red-300" : "bg-transparent"} outline-none`}
              onChange={handleType}
              onKeyDown={handleBackspace}
              value={word}
            />
          </p>
        </div>
        <SearchResults data={results} />
      </div>
    </div>
  );
};

const isAlpha = (char: string) => {
  return /^[A-Za-z]+$/.test(char);
};

const canTypeCharacter = () => {};
