import * as functions from "firebase-functions/v1";
import {
  postAllLanguagesTrends,
  updateAllLanguagesTrends,
} from "../core/allLanguages.js";
import { postFrontendTrends, updateFrontendTrends } from "../core/frontend.js";
import { postRustTrends, updateRustTrends } from "../core/rust.js";
import { SECRETS } from "../lib/firebase.js";

const runtimeOpts = {
  timeoutSeconds: 180,
  memory: "512MB" as const,
  secrets: [SECRETS],
};

export const scrappingGitHubTrends = functions
  .runWith(runtimeOpts)
  .https.onRequest(async (_req, res) => {
    let hasError = false;
    const errorMessages: string[] = [];

    const errorHandler = (e: unknown, type: string) => {
      const errorMessage = `${type} tweet scrapping error\n${e}`;
      console.error(errorMessage);
      hasError = true;
      errorMessages.push(errorMessage);
    };

    // NOTE: Run in series to prevent stop in case of rejects
    await Promise.all([
      updateAllLanguagesTrends().catch((e) => errorHandler(e, "All languages")),
      updateFrontendTrends().catch((e) => errorHandler(e, "Frontend")),
      updateRustTrends().catch((e) => errorHandler(e, "Rust")),
    ]);

    if (!hasError) {
      res.send("success");
    } else {
      res.status(500).send(errorMessages.join("\n"));
    }
  });

export const postGitHubTrends = functions
  .runWith(runtimeOpts)
  .https.onRequest(async (_req, res) => {
    let hasError = false;
    const errorMessages: string[] = [];

    const errorHandler = (e: unknown, type: string) => {
      const errorMessage = `${type} post error\n${e}`;
      console.error(errorMessage);
      hasError = true;
      errorMessages.push(errorMessage);
    };

    const secrets = SECRETS.value();
    // NOTE: Run in series to prevent stop in case of rejects
    await Promise.all([
      postAllLanguagesTrends(secrets).catch((e) =>
        errorHandler(e, "All languages"),
      ),
      postFrontendTrends(secrets).catch((e) => errorHandler(e, "Frontend")),
      postRustTrends(secrets).catch((e) => errorHandler(e, "Rust")),
    ]);

    if (!hasError) {
      res.send("success");
    } else {
      res.status(500).send(errorMessages.join("\n"));
    }
  });
