import * as functions from "firebase-functions/v1";
import { postAllLanguagesTrends } from "../core/allLanguages.js";
import { postFrontendTrends } from "../core/frontend.js";
import { SECRETS } from "../lib/firebase.js";
import { postRustTrends } from "../core/rust.js";

const runtimeOpts = {
  timeoutSeconds: 360,
  memory: "512MB" as const,
  secrets: [SECRETS],
};

export const postTrend = functions
  .runWith(runtimeOpts)
  .pubsub.schedule("every 1 hours")
  .onRun(async () => {
    const secrets = SECRETS.value();
    try {
      await Promise.all([
        postAllLanguagesTrends(secrets),
        postFrontendTrends(secrets),
        postRustTrends(secrets),
      ]);
    } catch (e) {
      console.error(e);
    }
  });
