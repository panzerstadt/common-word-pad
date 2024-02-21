export const SearchResults: React.FC<{ data: string[] }> = ({ data }) => {
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
