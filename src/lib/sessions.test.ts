import { describe, it, expect } from "vitest";
import {
  getRaceSessions,
  getWeekendInfo,
  resolveCurrentRace,
} from "./sessions";
import type { Race } from "./types";

function makeRace(overrides: Partial<Race> = {}): Race {
  return {
    season: "2026",
    round: "7",
    url: "",
    raceName: "Barcelona Grand Prix",
    Circuit: {
      circuitId: "catalunya",
      url: "",
      circuitName: "Circuit de Barcelona-Catalunya",
      Location: { lat: "41.57", long: "2.26", locality: "Barcelona", country: "Spain" },
    },
    date: "2026-06-14",
    time: "13:00:00Z",
    FirstPractice: { date: "2026-06-12", time: "11:30:00Z" },
    SecondPractice: { date: "2026-06-12", time: "15:00:00Z" },
    ThirdPractice: { date: "2026-06-13", time: "10:30:00Z" },
    Qualifying: { date: "2026-06-13", time: "14:00:00Z" },
    ...overrides,
  };
}

describe("getRaceSessions", () => {
  it("returns sessions ordered chronologically", () => {
    const sessions = getRaceSessions(makeRace(), new Date("2026-06-10T00:00:00Z"));
    expect(sessions.map((s) => s.key)).toEqual([
      "fp1",
      "fp2",
      "fp3",
      "qualifying",
      "race",
    ]);
  });

  it("only includes sessions present in the schedule", () => {
    const race = makeRace({ SecondPractice: undefined, ThirdPractice: undefined });
    const keys = getRaceSessions(race, new Date("2026-06-10T00:00:00Z")).map((s) => s.key);
    expect(keys).toEqual(["fp1", "qualifying", "race"]);
  });

  it("orders sprint sessions by their real start times", () => {
    const sprintRace = makeRace({
      FirstPractice: { date: "2026-05-01", time: "10:00:00Z" },
      SecondPractice: undefined,
      ThirdPractice: undefined,
      SprintQualifying: { date: "2026-05-01", time: "14:00:00Z" },
      Sprint: { date: "2026-05-02", time: "10:00:00Z" },
      Qualifying: { date: "2026-05-02", time: "14:00:00Z" },
      date: "2026-05-03",
      time: "13:00:00Z",
    });
    const keys = getRaceSessions(sprintRace, new Date("2026-04-30T00:00:00Z")).map((s) => s.key);
    expect(keys).toEqual(["fp1", "sprintQualifying", "sprint", "qualifying", "race"]);
  });

  it("marks past sessions done, the ongoing one live, and future ones upcoming", () => {
    // Qualifying runs 14:00–15:00Z on 2026-06-13.
    const sessions = getRaceSessions(makeRace(), new Date("2026-06-13T14:15:00Z"));
    const byKey = Object.fromEntries(sessions.map((s) => [s.key, s.status]));
    expect(byKey.fp1).toBe("done");
    expect(byKey.fp3).toBe("done");
    expect(byKey.qualifying).toBe("live");
    expect(byKey.race).toBe("upcoming");
  });
});

describe("getWeekendInfo", () => {
  it("reports the live session and the next one during a session", () => {
    const info = getWeekendInfo(makeRace(), new Date("2026-06-13T14:15:00Z"));
    expect(info.isLive).toBe(true);
    expect(info.liveSession?.key).toBe("qualifying");
    expect(info.nextSession?.key).toBe("race");
    expect(info.weekendActive).toBe(true);
  });

  it("is not live and not active before the weekend starts", () => {
    const info = getWeekendInfo(makeRace(), new Date("2026-06-12T09:00:00Z"));
    expect(info.isLive).toBe(false);
    expect(info.weekendActive).toBe(false);
    expect(info.nextSession?.key).toBe("fp1");
  });

  it("is not active after the race ends", () => {
    const info = getWeekendInfo(makeRace(), new Date("2026-06-14T16:00:00Z"));
    expect(info.isLive).toBe(false);
    expect(info.weekendActive).toBe(false);
    expect(info.nextSession).toBeNull();
  });
});

describe("resolveCurrentRace", () => {
  const past = makeRace({
    round: "6",
    date: "2026-06-07",
    time: "13:00:00Z",
    FirstPractice: { date: "2026-06-05", time: "11:00:00Z" },
    SecondPractice: { date: "2026-06-05", time: "15:00:00Z" },
    ThirdPractice: { date: "2026-06-06", time: "10:30:00Z" },
    Qualifying: { date: "2026-06-06", time: "14:00:00Z" },
  });
  const current = makeRace({ round: "7" });
  const future = makeRace({
    round: "8",
    date: "2026-06-21",
    time: "13:00:00Z",
    FirstPractice: { date: "2026-06-19", time: "11:00:00Z" },
    SecondPractice: undefined,
    ThirdPractice: undefined,
    Qualifying: { date: "2026-06-20", time: "14:00:00Z" },
  });
  const races = [future, past, current]; // unsorted on purpose

  it("returns the weekend in progress as current", () => {
    const r = resolveCurrentRace(races, new Date("2026-06-13T14:15:00Z"));
    expect(r?.race.round).toBe("7");
    expect(r?.isCurrent).toBe(true);
    expect(r?.isPast).toBe(false);
  });

  it("returns the next upcoming race when no weekend is active", () => {
    const r = resolveCurrentRace(races, new Date("2026-06-16T00:00:00Z"));
    expect(r?.race.round).toBe("8");
    expect(r?.isCurrent).toBe(false);
    expect(r?.isPast).toBe(false);
  });

  it("returns the most recent race when the season is over", () => {
    const r = resolveCurrentRace(races, new Date("2026-12-01T00:00:00Z"));
    expect(r?.race.round).toBe("8");
    expect(r?.isPast).toBe(true);
  });

  it("returns null for an empty schedule", () => {
    expect(resolveCurrentRace([], new Date())).toBeNull();
  });
});
