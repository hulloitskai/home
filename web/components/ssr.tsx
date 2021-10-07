import { FC, useEffect, useState } from "react";
import { useLayoutEffect as _useLayoutEffect } from "react";

export const ClientOnly: FC = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  return hasMounted ? <>{children}</> : null;
};

export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? _useLayoutEffect : useEffect;
