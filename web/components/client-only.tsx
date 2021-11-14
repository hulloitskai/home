import { isValidElement, FC } from "react";
import dynamic from "next/dynamic";

export const ClientOnly = dynamic(() => Promise.resolve(Noop), { ssr: false });

const Noop: FC = ({ children }) => {
  if (isValidElement(children)) {
    return children;
  }
  return null;
};
