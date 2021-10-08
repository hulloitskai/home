import { FC, useEffect, useState } from "react";

export const ClientOnly: FC = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  return hasMounted ? <>{children}</> : null;
};
