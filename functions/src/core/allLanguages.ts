import { GHTrendScraper } from "../lib/ghTrendScraper";
import {
  bulkInsertTrends,
  getUntweetedTrend,
  insertOwner,
  updateTweetedFlag,
} from "../lib/firestore";
import { isUpdateTime, shuffle } from "../lib/utils";
import * as admin from "firebase-admin";
import { GHTrend } from "../types/types";
import { postRepository, replyToPostPerText } from "../lib/bskyService";
import * as functions from "firebase-functions";
import { BskyClient } from "../lib/bskyClient";
import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { OpenAIClient } from "../lib/openAIClient";

const db = admin.firestore();
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
  agent: BskyClient
): Promise<void> => {
  let bskyUser: ProfileView | null = null;
  if (trend.ownersTwitterAccount) {
    bskyUser = await agent.searchUser({
      term: trend.ownersTwitterAccount.replace("@", ""),
      limit: 1,
    });
  }
  await insertOwner(ownerCollectionRef, trend, bskyUser?.handle || "");
};

export const postAllLanguagesTrends = async (): Promise<void> => {
  // update trends data at several times a day.
  if (isUpdateTime()) {
    await updateAllLanguagesTrends();
    console.info("Update all repositories collections");
  }
  const agent = await BskyClient.createAgent({
    identifier: functions.config().bsky.id,
    password: functions.config().bsky.password,
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
  if (trendData.todayStarCount > 100) {
    try {
      const openAIClient = new OpenAIClient(functions.config().openai.api_key);
      const summary = await openAIClient.summarize(trendData.url);
      await replyToPostPerText(summary, result, agent);
    } catch (e) {
      console.error(e);
    }
  }
};
