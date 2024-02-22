import { useEffect, useRef, useState } from "react";
import { GraphData } from "./dictionary";
import { useAutoComplete } from "./useAutoComplete";
import { SearchResults } from "./SearchResults";
import { useBlink } from "./useBlink";
import { given } from "flooent";
import useDebouncedEffect from "use-debounced-effect";

export const MAX_WORDS = 500;

interface Props {
  onUpdate?: (graph: GraphData) => void;
  onInitGraph?: (graph: GraphData) => void;
}

export const AutoCompleteNotepad: React.FC<Props> = ({ onUpdate, onInitGraph }) => {
  const [content, setContent] = useState<string>("");
  const [wordPart, setWordPart] = useState<string>("");
  const [warn, flashWarn] = useBlink();

  const [results, graph, { handleSearch, handleLoadDictionary }] = useAutoComplete();
  const wordBreakRegex = /[\s,.\-:]/; // supported word breaks
  const isValidWord =
    wordPart === "" || results.find((res) => res === wordPart.replace(wordBreakRegex, ""));

  useEffect(() => {
    const COMMON_WORDS_1K = "1k.txt";
    fetch("/words/" + COMMON_WORDS_1K)
      .then((res) => res.text())
      .then((res) => {
        const all = res.split("\n");

        const wordsSubset = all.slice(0, MAX_WORDS);

        handleLoadDictionary(wordsSubset);
      });
  }, []);

  useEffect(() => {
    if (!!wordPart) {
      handleSearch(wordPart);
    } else {
      handleSearch("");
    }
  }, [wordPart]);

  useDebouncedEffect(
    () => {
      graph && onUpdate?.(graph);
    },
    { timeout: 50, ignoreInitialCall: true },
    [graph]
  );

  useEffect(() => {
    if (graph?.nodes && graph.nodes.length > 1) {
      onInitGraph?.(graph);
    }
  }, [graph?.nodes.length]);

  const handleType = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const valueArray = [...value];

    if (valueArray.every((v) => isAlpha(v))) {
      return setWordPart(value);
    }

    const lastChar = valueArray[value.length - 1];
    if (wordBreakRegex.test(lastChar) && isValidWord) {
      setContent((p) => `${p} ${value.trim()}`);
      setWordPart("");
      return;
    }

    flashWarn();
  };

  const handleBackspace = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && wordPart.length === 0) {
      // load the previous word back
      const lastWord = given.string(content).afterLast(" ").toString();
      setWordPart(lastWord);

      // remove the last item from content
      setContent((p) => given.string(p).beforeLast(" ").toString());
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const handleFocusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="fixed top-0 left-0 w-full px-8 pt-10 z-50 flex md:flex-row flex-col gap-2 items-start">
      <div className="max-w-lg w-full">
        <div className="transition-colors flex gap-2 relative w-full border-2 border-slate-400 overflow-hidden rounded-lg focus-within:border-sky-400">
          <p
            onClick={handleFocusInput}
            className="py-2 px-4 w-full h-52 bg-slate-100 test-white text-xl font-light"
          >
            {content}{" "}
            <input
              ref={inputRef}
              className={`${warn ? "bg-red-300" : "bg-transparent"} outline-none`}
              onChange={handleType}
              onKeyDown={handleBackspace}
              value={wordPart}
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
