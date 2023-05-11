import { GHTrend } from "../types/types";
import * as functions from "firebase-functions";
import { truncateText } from "./utils";
import { BskyClient } from "./bskyClient";
import { getOgImageFromUrl } from "./getOgImageFromUrl";

export const postRepository = async (trendData: GHTrend) => {
  const agent = await BskyClient.createAgent({
    identifier: functions.config().bsky.id,
    password: functions.config().bsky.password,
  });

  const text = createPostText(trendData);
  const og = await getOgImageFromUrl(trendData.url);
  const uploadedImage = await agent.uploadImage({
    image: og.uint8Array,
    encoding: "image/jpeg",
  });

  await agent.post({
    text,
    embed: {
      $type: "app.bsky.embed.external",
      external: {
        uri: trendData.url,
        thumb: {
          $type: "blob",
          ref: {
            $link: uploadedImage.$link,
          },
          mimeType: uploadedImage.mimeType,
          size: uploadedImage.size,
        },
        title: og.title,
        description: og.description,
      },
    },
  });
};

const createPostText = (trend: GHTrend): string => {
  const contentText = `
📦 ${trend.repository}
👤 ${trend.owner}
⭐ ${trend.starCount} (+${trend.todayStarCount})${
    trend.language ? `\n🗒 ${trend.language}` : ""
  }
${trend.description ? `\n${trend.description}` : ""}
`.trim();

  // The url will be a 30-character shortened URL, so the content will be truncate to 105 characters.
  return truncateText(contentText, 230) + `\n${trend.url}`;
};
