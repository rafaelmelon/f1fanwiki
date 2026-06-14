import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getRace, invalidateCache } from "./api";

function mockRaceResponse(round: string) {
  return {
    ok: true,
    json: async () => ({
      MRData: {
        RaceTable: {
          Races: [
            {
              season: "2026",
              round,
              raceName: `Race ${round}`,
              url: "",
              date: "2026-06-14",
              Circuit: { circuitId: "x", url: "", circuitName: "X", Location: {} },
            },
          ],
        },
      },
    }),
  };
}

describe("api fetch layer", () => {
  beforeEach(() => {
    invalidateCache("/2026/");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("dedupes concurrent requests for the same path", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => Promise.resolve(mockRaceResponse("90")));
    vi.stubGlobal("fetch", fetchMock);

    const [a, b] = await Promise.all([getRace("2026", "90"), getRace("2026", "90")]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(a?.round).toBe("90");
    expect(b?.round).toBe("90");
    vi.unstubAllGlobals();
  });

  it("serves the second call from cache without re-fetching", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => Promise.resolve(mockRaceResponse("91")));
    vi.stubGlobal("fetch", fetchMock);

    await getRace("2026", "91");
    await getRace("2026", "91");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });

  it("throws on a non-ok response", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getRace("2026", "92")).rejects.toThrow("API error: 500");
    vi.unstubAllGlobals();
  });
});
