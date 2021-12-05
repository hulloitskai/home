import { useUser } from "@auth0/nextjs-auth0";
import React, { FC, useEffect } from "react";

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
const noop = (...args: any[]) => {};
const heap = typeof window !== "undefined" ? window.heap : undefined;

export const getIdentity = (): string | undefined => heap?.identity;
export const setIdentity: HeapAnalytics["identify"] = heap?.identify ?? noop;
export const clearIdentity: HeapAnalytics["resetIdentity"] =
  heap?.resetIdentity ?? noop;
export const addUserProperties: HeapAnalytics["addUserProperties"] =
  heap?.addUserProperties ?? noop;
export const track: HeapAnalytics["track"] = heap?.track ?? noop;
export const addEventProperties: HeapAnalytics["addEventProperties"] =
  heap?.addEventProperties ?? noop;
export const removeEventProperty: HeapAnalytics["removeEventProperty"] =
  heap?.removeEventProperty ?? noop;
export const clearEventProperties: HeapAnalytics["clearEventProperties"] =
  heap?.clearEventProperties ?? noop;

export const HeapTracker: FC = ({ children }) => {
  const { user } = useUser();
  useEffect(() => {
    if (user?.sub) {
      setIdentity(user.sub);
    }
  }, [user]);
  return <>{children}</>;
};
