import { GHTrendScraper } from "../lib/ghTrendScraper";
import {
  bulkInsertTrends,
  getUntweetedTrend,
  updateTweetedFlag,
} from "../lib/firestore";
import { isUpdateTime, shuffle } from "../lib/utils";
import * as admin from "firebase-admin";
import { GHTrend } from "../types/types";
import { postRepository } from "../lib/bskyService";
import * as functions from "firebase-functions";
import { BskyClient } from "../lib/bskyClient";

const db = admin.firestore();
const collectionRef = db.collection("v1").doc("trends").collection("frontend");

export const updateFrontendTrends = async (): Promise<void> => {
  const jsTrends = await GHTrendScraper.scraping("/javascript");
  const tsTrends = await GHTrendScraper.scraping("/typescript");
  // filter today's star count > 50
  const trends = shuffle([...jsTrends, ...tsTrends]).filter(
    (t) => t.todayStarCount > 50
  );
  await bulkInsertTrends(collectionRef, trends);
};

export const postFrontendTrends = async (): Promise<void> => {
  // update trends data at several times a day.
  if (isUpdateTime()) {
    await updateFrontendTrends();
    console.info("Update frontend repositories collections");
  }

  const snapshot = await getUntweetedTrend(collectionRef);
  if (snapshot.empty) {
    console.error("No matching documents.");
    return;
  }
  const doc = snapshot.docs.at(0)!;
  const trendData = doc.data() as GHTrend;

  const agent = await BskyClient.createAgent({
    identifier: functions.config().bsky.frontend_id,
    password: functions.config().bsky.frontend_password,
  });

  await postRepository(trendData, agent);
  await updateTweetedFlag(doc, true);
};
