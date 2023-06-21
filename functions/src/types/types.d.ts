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
