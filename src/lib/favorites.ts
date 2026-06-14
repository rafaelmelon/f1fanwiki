export const STORAGE_KEY = "f1wiki_pinned_drivers";
export const FAVORITES_EVENT = "f1wiki:favorites-changed";

function notifyChange(): void {
  // Same-tab listeners (the `storage` event only fires in *other* tabs).
  window.dispatchEvent(new Event(FAVORITES_EVENT));
}

export interface PinnedDriver {
  driverId: string;
  givenName: string;
  familyName: string;
  code?: string;
  nationality: string;
  url?: string;
}

export function getPinnedDrivers(): PinnedDriver[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isPinned(driverId: string): boolean {
  return getPinnedDrivers().some((d) => d.driverId === driverId);
}

export function pinDriver(driver: PinnedDriver): void {
  const current = getPinnedDrivers();
  if (!current.some((d) => d.driverId === driver.driverId)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, driver]));
    notifyChange();
  }
}

export function unpinDriver(driverId: string): void {
  const current = getPinnedDrivers().filter((d) => d.driverId !== driverId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  notifyChange();
}

export function togglePin(driver: PinnedDriver): boolean {
  if (isPinned(driver.driverId)) {
    unpinDriver(driver.driverId);
    return false;
  }
  pinDriver(driver);
  return true;
}
