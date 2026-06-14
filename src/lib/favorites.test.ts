import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getPinnedDrivers,
  isPinned,
  pinDriver,
  unpinDriver,
  togglePin,
  FAVORITES_EVENT,
  type PinnedDriver,
} from "./favorites";

const alonso: PinnedDriver = {
  driverId: "alonso",
  givenName: "Fernando",
  familyName: "Alonso",
  nationality: "Spanish",
};

describe("favorites", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("pins and reads back a driver", () => {
    pinDriver(alonso);
    expect(isPinned("alonso")).toBe(true);
    expect(getPinnedDrivers()).toHaveLength(1);
  });

  it("does not pin the same driver twice", () => {
    pinDriver(alonso);
    pinDriver(alonso);
    expect(getPinnedDrivers()).toHaveLength(1);
  });

  it("unpins a driver", () => {
    pinDriver(alonso);
    unpinDriver("alonso");
    expect(isPinned("alonso")).toBe(false);
  });

  it("toggle returns the new pinned state", () => {
    expect(togglePin(alonso)).toBe(true);
    expect(togglePin(alonso)).toBe(false);
  });

  it("dispatches a same-tab change event when pinning", () => {
    const handler = vi.fn();
    window.addEventListener(FAVORITES_EVENT, handler);
    pinDriver(alonso);
    expect(handler).toHaveBeenCalledOnce();
    window.removeEventListener(FAVORITES_EVENT, handler);
  });

  it("returns an empty list when storage holds invalid JSON", () => {
    localStorage.setItem("f1wiki_pinned_drivers", "{not json");
    expect(getPinnedDrivers()).toEqual([]);
  });
});
