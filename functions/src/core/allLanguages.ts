import { GHTrendScraper } from "../lib/ghTrendScraper";
import {
  bulkInsertTrends,
  getUntweetedTrend,
  updateTweetedFlag,
} from "../lib/firestore";
import { isUpdateTime, shuffle } from "../lib/utils";
import * as admin from "firebase-admin";
import { GHTrend } from "../types/types";
import { postRepository } from "../lib/bskyClient";

const db = admin.firestore();
const collectionRef = db.collection("v1").doc("trends").collection("all");

export const updateAllLanguagesTrends = async (): Promise<void> => {
  const trends = await GHTrendScraper.scraping();
  await bulkInsertTrends(collectionRef, shuffle(trends));
};

export const tweetAllLanguagesTrends = async (): Promise<void> => {
  // update trends data at several times a day.
  if (isUpdateTime()) {
    await updateAllLanguagesTrends();
    console.info("Update all repositories collections");
  }
  const snapshot = await getUntweetedTrend(collectionRef);
  if (snapshot.empty) {
    console.error("No matching documents.");
    return;
  }
  const doc = snapshot.docs.at(0)!;
  const trendData = doc.data() as GHTrend;
  await postRepository(trendData);
  await updateTweetedFlag(doc, true);
};
