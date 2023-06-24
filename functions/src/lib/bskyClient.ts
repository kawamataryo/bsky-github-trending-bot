import { AppBskyFeedPost, AppBskyRichtextFacet, BskyAgent } from "@atproto/api";
import { ReplyRef } from "@atproto/api/dist/client/types/app/bsky/feed/post";

export class BskyClient {
  private service = "https://bsky.social";
  agent: BskyAgent;
  private constructor() {
    this.agent = new BskyAgent({ service: this.service });
  }

  public static async createAgent({
    identifier,
    password,
  }: {
    identifier: string;
    password: string;
  }): Promise<BskyClient> {
    const client = new BskyClient();
    await client.agent.login({ identifier, password });
    return client;
  }

  public async post({
    text,
    facets,
    embed,
    reply,
  }: {
    text: string;
    facets?: AppBskyRichtextFacet.Main[];
    embed?: AppBskyFeedPost.Record["embed"];
    reply?: ReplyRef;
  }): Promise<{ cid: string; uri: string }> {
    const postParams: AppBskyFeedPost.Record = {
      $type: "app.bsky.feed.post",
      text,
      facets,
      createdAt: new Date().toISOString(),
    };
    if (embed) {
      postParams.embed = embed;
    }
    if (reply) {
      postParams.reply = reply;
    }
    return await this.agent.post(postParams);
  }

  public uploadImage = async ({
    image,
    encoding,
  }: {
    image: Uint8Array;
    encoding: string;
  }) => {
    const response = await this.agent.uploadBlob(image, {
      encoding,
    });
    return {
      $link: response.data.blob.ref.toString(),
      mimeType: response.data.blob.mimeType,
      size: response.data.blob.size,
    };
  };

  public searchUser = async ({
    term,
    limit,
  }: {
    term: string;
    limit: number;
  }) => {
    const result = await this.agent.searchActors({
      term,
      limit,
    });
    if (result.data.actors.length === 0) {
      return null;
    } else {
      return result.data.actors[0];
    }
  };
}
