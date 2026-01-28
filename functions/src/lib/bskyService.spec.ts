import { describe, it, expect } from "vitest";
import {
  getStarIncreaseLabel,
  splitStringForThreadText,
} from "./bskyService.js";

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

describe("splitStringForThreadText", () => {
  it("should return text group", () => {
    const result = splitStringForThreadText(
      "RxDB is an offline-first, reactive NoSQL database for JavaScript applications that can be used in various environments such as websites, hybrid apps, Electron apps, Progressive Web Apps, and Node.js. It provides a protocol for real-time replication with existing infrastructure and has a flexible storage layer that can be swapped out for different storage engines. RxDB supports multi-tab/window usage and implements the Event-Reduce algorithm for performance optimization. It also supports encryption, import/export, and key compression. RxDB can be used with various JavaScript runtimes such as Browsers, Node.js, Electron, React Native, Cordova/Phonegap, Capacitor, NativeScript, and Flutter.",
      300,
    );
    expect(result).toEqual([
      "RxDB is an offline-first, reactive NoSQL database for JavaScript applications that can be used in various environments such as websites, hybrid apps, Electron apps, Progressive Web Apps, and Node.js. It provides a protocol for real-time replication with existing infrastructure and has a (1/3)",
      "flexible storage layer that can be swapped out for different storage engines. RxDB supports multi-tab/window usage and implements the Event-Reduce algorithm for performance optimization. It also supports encryption, import/export, and key compression. RxDB can be used with various JavaScript (2/3)",
      "runtimes such as Browsers, Node.js, Electron, React Native, Cordova/Phonegap, Capacitor, NativeScript, and Flutter. (3/3)",
    ]);
  });
});
