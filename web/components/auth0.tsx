import { useEffect } from "react";
import { useUser, UserContext } from "@auth0/nextjs-auth0";

export const useAuthentication = (): UserContext => {
  const context = useUser();
  const { user, isLoading: userIsLoading } = context;
  useEffect(() => {
    if (!userIsLoading && !user) {
      if (typeof window !== "undefined") {
        const search = new URLSearchParams({
          returnTo: window.location.pathname,
        });
        window.location.href = "api/auth/login?" + search.toString();
      }
    }
  }, [user, userIsLoading]);
  return context;
};
