import { describe, it, expect } from "vitest";
import { getStarIncreaseLabel } from "./bskyService";

describe("getStarIncreaseLabel", () => {
  it.each([
    [0, ""],
    [99, ""],
    [100, "🔥 Hot Repo！ 🔥 (100+ new stars)"],
    [199, "🔥 Hot Repo！ 🔥 (100+ new stars)"],
    [200, "🚀 Skyrocketing！ 🚀 (200+ new stars)"],
    [499, "🚀 Skyrocketing！ 🚀 (200+ new stars)"],
    [500, "🎉 Celebrating！ 🎉 (500+ new stars)"],
    [999, "🎉 Celebrating！ 🎉 (500+ new stars)"],
    [1000, "💎 Hidden Gem！ 💎 (1000+ new stars)"],
    [1001, "💎 Hidden Gem！ 💎 (1000+ new stars)"],
  ])("should return label by star count", (starCount, expected) => {
    expect(getStarIncreaseLabel(starCount)).toBe(expected);
  });
});
