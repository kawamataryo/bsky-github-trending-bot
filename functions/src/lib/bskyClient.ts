import { BskyAgent, RichText } from "@atproto/api";
import ogs from "open-graph-scraper";
import sharp from "sharp";
import * as functions from "firebase-functions";

import { GHTrend, OpenGraph } from "../types/types";

const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? text.substr(0, maxLength) + "..." : text;
};

const createPostText = (trend: GHTrend): string => {
  const contentText = `
📦 ${trend.repository}
👤 ${trend.owner}
⭐ ${trend.starCount} (+${trend.todayStarCount})${
    trend.language ? `\n🗒 ${trend.language}` : ""
  }
🍴 ${trend.forkCount}
${trend.description ? `\n${trend.description}` : ""}
`.trim();

  // The url will be a 30-character shortened URL, so the content will be truncate to 105 characters.
  return truncateText(contentText, 260) + `\n${trend.url}`;
};

const getOgImageFromUrl = async (url: string): Promise<OpenGraph> => {
  const options = { url: url };
  const { result } = await ogs(options);

  return {
    url: result.ogImage?.at(0)?.url || "",
    type: result.ogImage?.at(0)?.type || "",
    description: result.ogDescription || "",
    title: result.ogTitle || "",
  };
};

const uploadImage = async (agent: BskyAgent, ogImage: OpenGraph) => {
  const res = await fetch(ogImage.url);
  const buffer = await res.arrayBuffer();
  // NOTE: resize image because of bsky.social's image size limit
  const compressedImage = await sharp(buffer)
    .resize(800, null, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 80,
      progressive: true,
    })
    .toBuffer();

  console.log("compressedImage", compressedImage.byteLength);

  const response = await agent.uploadBlob(new Uint8Array(compressedImage), {
    encoding: "image/jpeg",
  });
  return {
    $link: response.data.blob.ref.toString(),
    mimeType: response.data.blob.mimeType,
    size: response.data.blob.size,
  };
};

export const postRepository = async (trendData: GHTrend): Promise<void> => {
  // login to bsky.social
  const service = "https://bsky.social";
  const agent = new BskyAgent({ service: service });
  const identifier = functions.config().bsky.id;
  const password = functions.config().bsky.password;
  await agent.login({ identifier, password });

  // create post
  const postText = createPostText(trendData);
  const repositoryUrl = trendData.url;
  const rt = new RichText({ text: postText });
  const og = await getOgImageFromUrl(repositoryUrl);
  const uploadRes = await uploadImage(agent, og);
  await rt.detectFacets(agent); // automatically detects mentions and links
  await agent.post({
    $type: "app.bsky.feed.post",
    text: rt.text,
    facets: rt.facets,
    createdAt: new Date().toISOString(),
    embed: {
      $type: "app.bsky.embed.external",
      external: {
        uri: repositoryUrl,
        thumb: {
          $type: "blob",
          ref: {
            $link: uploadRes.$link,
          },
          mimeType: uploadRes.mimeType,
          size: uploadRes.size,
        },
        title: og.title,
        description: og.description,
      },
    },
  });
};
