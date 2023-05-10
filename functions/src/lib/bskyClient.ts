import { AppBskyFeedPost, BskyAgent, RichText } from "@atproto/api";

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
    embed,
  }: {
    text: string;
    embed?: AppBskyFeedPost.Record["embed"];
  }): Promise<void> {
    const rt = new RichText({ text });
    await rt.detectFacets(this.agent);

    const postParams: AppBskyFeedPost.Record = {
      $type: "app.bsky.feed.post",
      text: rt.text,
      facets: rt.facets,
      createdAt: new Date().toISOString(),
    };
    if (embed) {
      postParams.embed = embed;
    }
    await this.agent.post(postParams);
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
}
