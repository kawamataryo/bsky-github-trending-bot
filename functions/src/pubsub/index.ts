import * as functions from "firebase-functions";
import { tweetAllLanguagesTrends } from "../core/allLanguages";

const runtimeOpts = {
  timeoutSeconds: 180,
  memory: "512MB" as const,
};

export const postTrend = functions
  .runWith(runtimeOpts)
  .pubsub.schedule("every 1 hours")
  .onRun(async (_context) => {
    try {
      await Promise.all([tweetAllLanguagesTrends()]);
    } catch (e) {
      console.error(e);
    }
  });
