export type GHTrend = {
  owner: string;
  repository: string;
  language: string;
  description: string;
  starCount: number;
  forkCount: number;
  todayStarCount: number;
  ownersTwitterAccount: string;
  url: string;
};

type OpenGraph = {
  url: string;
  type: string;
  description: string;
  title: string;
  uint8Array: Uint8Array;
};

type Secrets = {
  openai: {
    api_key: string;
  };
  bsky: {
    frontend_id: string;
    frontend_password: string;
    id: string;
    password: string;
    rust_id: string;
    rust_password: string;
  };
};
