import { GHTrendScraper } from "../lib/ghTrendScraper.js";
import {
  bulkInsertTrends,
  getUntweetedTrend,
  updateTweetedFlag,
} from "../lib/firestore.js";
import { isUpdateTime, shuffle } from "../lib/utils.js";
import { db } from "../lib/firebase.js";
import { GHTrend, Secrets } from "../types/types.js";
import { postRepository, replyToPostPerText } from "../lib/bskyService.js";
import { BskyClient } from "../lib/bskyClient.js";
import { OpenAIClient } from "../lib/openAIClient.js";
const collectionRef = db.collection("v1").doc("trends").collection("rust");

export const updateRustTrends = async (): Promise<void> => {
  const rustTrends = await GHTrendScraper.scraping("/rust");
  // filter today's star count > 50
  const trends = shuffle(rustTrends).filter(
    (t) => t.todayStarCount > 30,
  );
  await bulkInsertTrends(collectionRef, trends);
};

export const postRustTrends = async (secrets: Secrets): Promise<void> => {
  // update trends data at several times a day.
  if (isUpdateTime()) {
    await updateRustTrends();
    console.info("Update rust repositories collections");
  }

  const snapshot = await getUntweetedTrend(collectionRef);
  if (snapshot.empty) {
    console.error("No matching documents.");
    return;
  }
  const doc = snapshot.docs.at(0)!;
  const trendData = doc.data() as GHTrend;

  const agent = await BskyClient.createAgent({
    identifier: secrets.bsky.rust_id,
    password: secrets.bsky.rust_password,
  });

  const result = await postRepository(trendData, agent);
  await updateTweetedFlag(doc, true);

  // post summary if today's star count > 200
  console.log(
    "🚀 ~ file: rust.ts:53 ~ postRustTrends ~ trendData.todayStarCount:",
    trendData.todayStarCount,
  );
  if (trendData.todayStarCount > 200) {
    try {
      const openAIClient = new OpenAIClient(secrets.openai.api_key);
      const summary = await openAIClient.summarize(trendData);
      await replyToPostPerText(summary, result, agent);
    } catch (e) {
      console.error(e);
    }
  }
};
