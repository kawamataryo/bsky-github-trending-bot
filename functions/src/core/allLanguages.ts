import { GHTrendScraper } from "../lib/ghTrendScraper.js";
import {
  bulkInsertTrends,
  getUntweetedTrend,
  insertOwner,
  updateTweetedFlag,
} from "../lib/firestore.js";
import { isUpdateTime, shuffle } from "../lib/utils.js";
import { db } from "../lib/firebase.js";
import { GHTrend, Secrets } from "../types/types.js";
import { postRepository, replyToPostPerText } from "../lib/bskyService.js";
import * as functions from "firebase-functions";
import { BskyClient } from "../lib/bskyClient.js";
import { AppBskyActorDefs } from "@atproto/api";
import { OpenAIClient } from "../lib/openAIClient.js";
const trendCollectionRef = db.collection("v1").doc("trends").collection("all");
const ownerCollectionRef = db
  .collection("v1")
  .doc("github")
  .collection("owner");

export const updateAllLanguagesTrends = async (): Promise<void> => {
  const trends = await GHTrendScraper.scraping();
  await bulkInsertTrends(trendCollectionRef, shuffle(trends));
};

export const insertOrUpdateOwner = async (
  trend: GHTrend,
  agent: BskyClient,
): Promise<void> => {
  let bskyUser: AppBskyActorDefs.ProfileView | null = null;
  if (trend.ownersTwitterAccount) {
    bskyUser = await agent.searchUser({
      term: trend.ownersTwitterAccount.replace("@", ""),
      limit: 1,
    });
  }
  await insertOwner(ownerCollectionRef, trend, bskyUser?.handle || "");
};

export const postAllLanguagesTrends = async (secrets: Secrets): Promise<void> => {
  // update trends data at several times a day.
  if (isUpdateTime()) {
    await updateAllLanguagesTrends();
    console.info("Update all repositories collections");
  }
  const agent = await BskyClient.createAgent({
    identifier: secrets.bsky.id,
    password: secrets.bsky.password,
  });

  const snapshot = await getUntweetedTrend(trendCollectionRef);
  if (snapshot.empty) {
    console.error("No matching documents.");
    return;
  }

  const doc = snapshot.docs.at(0)!;
  const trendData = doc.data() as GHTrend;

  const result = await postRepository(trendData, agent);
  await updateTweetedFlag(doc, true);
  console.log(
    "🚀 ~ file: frontend.ts:53 ~ postFrontendTrends ~ trendData.todayStarCount:",
    trendData.todayStarCount,
  );
  if (trendData.todayStarCount > 200) {
    try {
      const openAIClient = new OpenAIClient(secrets.openai.api_key);
      const summary = await openAIClient.summarize(trendData);
      console.log(
        "🚀 ~ file: allLanguages.ts:69 ~ postAllLanguagesTrends ~ summary:",
        summary,
      );
      await replyToPostPerText(summary, result, agent);
    } catch (e) {
      console.error(e);
    }
  }
};
