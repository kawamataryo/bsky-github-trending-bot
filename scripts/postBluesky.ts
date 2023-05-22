import { BskyClient } from "../functions/src/lib/bskyClient"
import { convertLinkText } from "../functions/src/lib/bskyService";
import { getOgImageFromUrl } from "../functions/src/lib/getOgImageFromUrl";
import yargs from "yargs";

const postWithLinkCard = async (_text: string, url: string) => {
  const agent = await BskyClient.createAgent({
    identifier: process.env.BLUESKY_IDENTIFIER!,
    password: process.env.BLUESKY_PASSWORD!,
  })

  const { text, facets } = convertLinkText(_text);
  const og = await getOgImageFromUrl(url);
  const uploadedImage = await agent.uploadImage({
    image: og.uint8Array,
    encoding: "image/jpeg",
  });

  await agent.post({
    text,
    facets,
    embed: {
      $type: "app.bsky.embed.external",
      external: {
        uri: url,
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
}

(async () => {
  const args = yargs.options({
    text: {
      type: "string",
      demandOption: true,
      describe: "Text to post",
      require: true,
      alias: "t",
    },
    url: {
      type: "string",
      demandOption: true,
      describe: "URL to post",
      require: true,
      alias: "u",
    }
  }).parseSync()

  await postWithLinkCard(args.text, args.url)
})()
