import sharp from "sharp";
import { OpenGraph } from "../types/types";
import ogs from "open-graph-scraper";

export const getOgImageFromUrl = async (url: string): Promise<OpenGraph> => {
  const options = { url: url };
  const { result } = await ogs(options);
  const res = await fetch(result.ogImage?.at(0)?.url || "");

  // minify image size because of bsky.social's image size limit
  const buffer = await res.arrayBuffer();
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

  return {
    url: result.ogImage?.at(0)?.url || "",
    type: result.ogImage?.at(0)?.type || "",
    description: result.ogDescription || "",
    title: result.ogTitle || "",
    uint8Array: new Uint8Array(compressedImage),
  };
};
