import { Fragment } from "react";
import dynamic from "next/dynamic";

export const ClientOnly = dynamic(() => Promise.resolve(Fragment), {
  ssr: false,
});
