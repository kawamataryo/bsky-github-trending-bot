import * as functions from "firebase-functions";
import { postAllLanguagesTrends } from "../core/allLanguages.js";
import { postFrontendTrends } from "../core/frontend.js";

const runtimeOpts = {
  timeoutSeconds: 360,
  memory: "512MB" as const,
};

export const postTrend = functions
  .runWith(runtimeOpts)
  .pubsub.schedule("every 1 hours")
  .onRun(async () => {
    try {
      await Promise.all([postAllLanguagesTrends(), postFrontendTrends()]);
    } catch (e) {
      console.error(e);
    }
  });
