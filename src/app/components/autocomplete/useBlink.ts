import { useEffect, useState } from "react";

export const useBlink = (expiry = 500) => {
  const [warn, setWarn] = useState(false);

  useEffect(() => {
    let timer = null;
    if (warn === true) {
      timer = setTimeout(() => setWarn(false), expiry);
    }
    return () => {
      timer && clearTimeout(timer);
    };
  }, [warn, expiry]);

  const toggle = () => {
    setWarn(true);
  };

  return [warn, toggle] as const;
};
