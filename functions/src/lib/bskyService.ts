import { GHTrend } from "../types/types";
import { truncateText } from "./utils";
import { BskyClient } from "./bskyClient";
import { getOgImageFromUrl } from "./getOgImageFromUrl";
import { ComAtprotoRepoStrongRef } from "@atproto/api";

export const postRepository = async (trendData: GHTrend, agent: BskyClient) => {
  const { text, facets } = convertLinkText(createPostText(trendData));
  const og = await getOgImageFromUrl(trendData.url);
  const uploadedImage = await agent.uploadImage({
    image: og.uint8Array,
    encoding: "image/jpeg",
  });

  return await agent.post({
    text: truncateText(text, 290),
    facets,
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

export const getStarIncreaseLabel = (starCount: number): string => {
  const STAR_INCREASE_LABELS = [
    { threshold: 100, label: "🔥 Hot Repo！ 🔥 (100+ new stars)" },
    { threshold: 200, label: "🚀 Skyrocketing！ 🚀 (200+ new stars)" },
    { threshold: 500, label: "🎉 Celebrating！ 🎉 (500+ new stars)" },
    { threshold: 1000, label: "💎 Hidden Gem！ 💎 (1000+ new stars)" },
  ];
  const labels = STAR_INCREASE_LABELS.filter((l) => l.threshold <= starCount);
  if (labels.length === 0) {
    return "";
  } else {
    return labels.at(-1)!.label;
  }
};

export const createPostText = (trend: GHTrend): string => {
  return `
${getStarIncreaseLabel(trend.todayStarCount)}

📦 [${trend.owner}](https://github.com/${trend.owner}) / [${
    trend.repository
  }](https://github.com/${trend.owner}/${trend.repository})
⭐ ${trend.starCount.toLocaleString()} (+${trend.todayStarCount.toLocaleString()})${
    trend.language ? `\n🗒 ${trend.language}` : ""
  }
${trend.description ? `\n${trend.description}` : ""}
`.trim();
};

// ref https://zenn.dev/kawarimidoll/articles/42efe3f1e59c13
export const convertLinkText = (src: string) => {
  const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
  const facets = [];

  while (src.match(mdLinkRegex)) {
    const links = src.match(mdLinkRegex);
    if (!links) break;
    const [matched, anchor, uri] = links;
    src = src.replace(matched, anchor);

    const byteStart = new TextEncoder().encode(
      src.substring(0, links.index)
    ).byteLength;
    const byteEnd = byteStart + new TextEncoder().encode(anchor).byteLength;

    facets.push({
      index: { byteStart, byteEnd },
      features: [{ $type: "app.bsky.richtext.facet#link", uri }],
    });
  }
  return { text: src, facets };
};

export const splitStringForThreadText = (text: string, limit: number) => {
  const words = text.split(" ");
  const chunks = [];
  let currentChunk = "";

  words.forEach((word) => {
    if ((currentChunk + word).length <= limit - 5) {
      currentChunk += word + " ";
    } else {
      chunks.push(currentChunk.trim());
      currentChunk = word + " ";
    }
  });

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  const total = chunks.length;
  if (total === 1) return chunks;
  return chunks.map((chunk, index) => `${chunk} (${index + 1}/${total})`);
};

export const replyToPostPerText = async (
  text: string,
  rootPostRef: ComAtprotoRepoStrongRef.Main,
  agent: BskyClient
) => {
  const treadTexts = splitStringForThreadText(`📝 Summary: \n\n${text}`, 300);
  let targetPostRef = rootPostRef;

  for (const text of treadTexts) {
    const result = await agent.post({
      text,
      reply: {
        root: rootPostRef,
        parent: targetPostRef,
      },
    });
    targetPostRef = result;
  }
};
