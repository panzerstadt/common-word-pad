import { useEffect, useState } from "react";
import { useAutoComplete } from "./useAutoComplete";
import { GraphData } from "./dictionary";
import { given } from "flooent";
import useDebouncedEffect from "use-debounced-effect";
import { SearchResults } from "./SearchResults";

// TODO:
/**
 *
 * currently when i mistype, i can no longer backspace and neither can i type anything else, i'm stuck
 *
 * todo:
 * - queue for keystroke input
 * - debounce for trie (probably very short, or actually something that depends on my wpm, i coud write up somethign smart for that)
 * - FIXME: block user from pressing spacebar or a non-alpha when the trie is still running
 * - if there is no result from the trie at the end, label the word red (notFound flag probably)
 * - when word is red, allow only:
 *     - alpha characters
 *     - backspace
 * - when the word is not red, allow
 *     - alpha characters
 *     - backspace
 *     - finisher characters (spacebar, comma, fullstop etc)
 *
 * - sounds like i should just use a state machine for this (nested switch statements, not xstate)
 * - but i can use xstate to model this system first
 *
 * bonuses:
 * - generate an image (with debounce) of what i'm trying to write/describe as it goes along
 * - get the graph running again
 *
 * i can also debounce, to make sure if the words ar
 */

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
    const COMMON_WORDS_1K = "1k.txt";
    setIsBusy(true);
    fetch("/words/" + COMMON_WORDS_1K)
      .then((res) => res.text())
      .then((res) => {
        const all = res.split("\n");

        const wordsSubset = all; //.slice(0, 10);

        handleLoadDictionary(wordsSubset);
        setIsBusy(false);
      });
  }, []);

  useDebouncedEffect(
    () => {
      if (isValid) return;
      graph && onUpdate?.(graph);
    },
    300,
    [graph, isValid]
  );

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
