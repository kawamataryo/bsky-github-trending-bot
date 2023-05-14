import dayjs from "dayjs";
import { GHTrend } from "../types/types";

const getExcludedInsertData = async (
  collectionRef: FirebaseFirestore.CollectionReference
): Promise<GHTrend[]> => {
  // exclude repositories submitted within 4 days.
  const weekAgo = dayjs().add(-4, "day").unix();
  const querySnapshotFromOneWeekAgo = await collectionRef
    .where("createdAt", ">=", weekAgo)
    .get();
  return querySnapshotFromOneWeekAgo.docs.map((doc) => doc.data() as GHTrend);
};

export const bulkInsertTrends = async (
  collectionRef: FirebaseFirestore.CollectionReference,
  trends: GHTrend[]
): Promise<void> => {
  const excludeData = await getExcludedInsertData(collectionRef);

  await Promise.all(
    trends.map(async (trend) => {
      if (excludeData.some((d) => d.url === trend.url)) {
        return Promise.resolve();
      }
      return await collectionRef.add({
        ...trend,
        createdAt: dayjs().unix(),
        tweeted: false,
      });
    })
  );
};

export const getUntweetedTrend = async (
  collectionRef: FirebaseFirestore.CollectionReference
): Promise<FirebaseFirestore.QuerySnapshot> => {
  // The target is items created within the last 2 days.
  const twoDaysBeforeTime = dayjs().add(-2, "day").unix();

  return await collectionRef
    .where("createdAt", ">=", twoDaysBeforeTime)
    .where("tweeted", "==", false)
    .limit(1)
    .get();
};

export const updateTweetedFlag = async (
  document: FirebaseFirestore.QueryDocumentSnapshot,
  tweeted: boolean
): Promise<void> => {
  await document.ref.update({ tweeted });
};

export const insertOwner = async (
  collectionRef: FirebaseFirestore.CollectionReference,
  trend: GHTrend,
  bskyHandle: string
) => {
  await collectionRef.doc(trend.owner).set({
    name: trend.owner,
    twitterId: trend.ownersTwitterAccount,
    twitterProfileUrl: trend.ownersTwitterAccount.replace(
      "@",
      "https://twitter.com/"
    ),
    blueskyHandle: bskyHandle,
    blueskyProfileUrl: bskyHandle
      ? `https://staging.bsky.app/profile/${bskyHandle}`
      : "",
    createdAt: dayjs().unix(),
    isChecked: false,
  });
};
