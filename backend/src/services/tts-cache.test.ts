import { describe, it, expect, beforeEach } from "vitest";

import {
  createChunkCacheKey,
  getChunkCache,
  setChunkCache,
  clearChunkCache,
} from "./tts-cache.js";

describe("tts-cache", () => {
  beforeEach(() => {
    clearChunkCache();
  });

  it("generates deterministic keys based on turns and voice pair", () => {
    const turns = [{ speaker: "HostA", text: "Hello world" }];
    const key1 = createChunkCacheKey(turns, "male_female");
    const key2 = createChunkCacheKey(turns, "male_female");
    const key3 = createChunkCacheKey(turns, "female_female");

    expect(key1).toBe(key2);
    expect(key1).not.toBe(key3);
  });

  it("stores and retrieves audio buffers from cache", () => {
    const key = "test-key";
    const audio = Buffer.from("audio-pcm-data");

    expect(getChunkCache(key)).toBeUndefined();
    setChunkCache(key, audio);
    expect(getChunkCache(key)).toEqual(audio);
  });

  it("clears cache upon request", () => {
    const key = "test-key";
    setChunkCache(key, Buffer.from("data"));
    clearChunkCache();
    expect(getChunkCache(key)).toBeUndefined();
  });
});
