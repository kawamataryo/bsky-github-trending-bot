import * as functions from "firebase-functions";
import {
  postAllLanguagesTrends,
  updateAllLanguagesTrends,
} from "../core/allLanguages";
import { postFrontendTrends, updateFrontendTrends } from "../core/frontend";

const runtimeOpts = {
  timeoutSeconds: 180,
  memory: "512MB" as const,
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

    // NOTE: Run in series to prevent stop in case of rejects
    await Promise.all([
      postAllLanguagesTrends().catch((e) => errorHandler(e, "All languages")),
      postFrontendTrends().catch((e) => errorHandler(e, "Frontend")),
    ]);

    if (!hasError) {
      res.send("success");
    } else {
      res.status(500).send(errorMessages.join("\n"));
    }
  });
