import { useEffect, useRef, useState } from "react";
import { Dictionary, GraphData } from "./dictionary";

export const useAutoComplete = () => {
  const dictRef = useRef<Dictionary>();
  const [results, setResults] = useState<string[]>([]);
  const [graph, setGraph] = useState<GraphData>();

  useEffect(() => {
    const dict = Dictionary();
    dict.learn("try");
    dict.learn("adding");
    dict.learn("new");
    dict.learn("letters");
    setGraph(dict.graph());
    dictRef.current = dict;
  }, []);

  const handleLearn = (word: string) => {
    dictRef.current?.learn(word);
  };

  const handleForget = (word: string) => {
    dictRef.current?.unlearn(word);
  };

  const handleSearch = (partial: string) => {
    const res = dictRef.current?.search(partial);

    setGraph(dictRef.current?.graph(partial));
    setResults(res || []);
  };

  const handleLoadDictionary = (words: string[]) => {
    for (const word of words) {
      dictRef.current?.learn(word);
    }
    setGraph(dictRef.current?.graph());
  };

  return [
    results,
    graph,
    { handleSearch, handleLearn, handleForget, handleLoadDictionary },
  ] as const;
};
