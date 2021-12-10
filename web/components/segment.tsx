import { createContext, FC, useContext, useEffect, useState } from "react";
import { Analytics, AnalyticsBrowser } from "@segment/analytics-next";

import { segmentWriteKey } from "config";
import { useUser } from "@auth0/nextjs-auth0";

const AnalyticsContext = createContext<Analytics | null | undefined>(undefined);

export const AnalyticsProvider: FC = ({ children }) => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  useEffect(() => {
    const load = async () => {
      if (segmentWriteKey) {
        const [analytics] = await AnalyticsBrowser.load({
          writeKey: segmentWriteKey,
        });
        setAnalytics(analytics);
        console.info("[Segment] Successfully initialized analytics");
      } else {
        console.warn("[Segment] Missing write key; skipping initialization");
      }
    };
    load();
  }, []);

  const { user } = useUser();
  useEffect(() => {
    if (analytics) {
      if (user?.sub) {
        const { sub: userId, email } = user;
        analytics.identify(userId, { email });
      } else {
        analytics.identify();
      }
    }
  }, [analytics, user]);

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = (): Analytics | null => {
  const analytics = useContext(AnalyticsContext);
  if (analytics === undefined) {
    throw new Error("Missing AnalyticsProvider.");
  }
  return analytics;
};

export type TrackPageOptions = {
  category?: string;
  name?: string;
};

export const useTrackPage = (options?: TrackPageOptions): void => {
  const analytics = useAnalytics();
  useEffect(
    () => {
      if (analytics) {
        const { category, name } = options ?? {};
        analytics.page(category, name);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [analytics],
  );
};
