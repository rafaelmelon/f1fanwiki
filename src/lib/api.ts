import type {
  Season,
  Race,
  RaceWithResults,
  DriverStanding,
  ConstructorStanding,
  Driver,
  Circuit,
  RaceResult,
  QualifyingResult,
  PitStop,
} from "./types";

const BASE = "https://api.jolpi.ca/ergast/f1";
const CACHE_TTL = 5 * 60 * 1000;
// Jolpica is rate-limited (~4 req/s burst). Cap concurrency to stay polite
// while still letting independent requests run in parallel.
const MAX_CONCURRENT = 4;

interface CacheEntry {
  data: unknown;
  ts: number;
}

const STORAGE_PREFIX = "f1wiki_cache:";
const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();

function readCache(path: string): CacheEntry | undefined {
  const mem = cache.get(path);
  if (mem) return mem;
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + path);
    if (!raw) return undefined;
    const entry = JSON.parse(raw) as CacheEntry;
    cache.set(path, entry); // promote into memory
    return entry;
  } catch {
    return undefined;
  }
}

function writeCache(path: string, entry: CacheEntry): void {
  cache.set(path, entry);
  try {
    sessionStorage.setItem(STORAGE_PREFIX + path, JSON.stringify(entry));
  } catch {
    // Quota exceeded or storage unavailable — in-memory cache still works.
  }
}

let active = 0;
const waiters: Array<() => void> = [];

function acquire(): Promise<void> {
  if (active < MAX_CONCURRENT) {
    active++;
    return Promise.resolve();
  }
  return new Promise((resolve) => waiters.push(resolve));
}

function release(): void {
  active--;
  const next = waiters.shift();
  if (next) {
    active++;
    next();
  }
}

/** Drop cached entries whose path contains `substring` (used by live polling). */
export function invalidateCache(substring: string): void {
  for (const key of cache.keys()) {
    if (key.includes(substring)) cache.delete(key);
  }
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX) && key.includes(substring)) {
        sessionStorage.removeItem(key);
      }
    }
  } catch {
    // ignore storage errors
  }
}

async function fetchApi<T>(path: string): Promise<T> {
  const cached = readCache(path);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data as T;
  }

  // Dedupe concurrent requests for the same path (e.g. current driver ids
  // requested by several pages at once).
  const pending = inflight.get(path);
  if (pending) return pending as Promise<T>;

  const request = (async () => {
    await acquire();
    try {
      const res = await fetch(`${BASE}${path}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = await res.json();
      const data = json.MRData as T;
      writeCache(path, { data, ts: Date.now() });
      return data;
    } finally {
      release();
      inflight.delete(path);
    }
  })();

  inflight.set(path, request);
  return request;
}

export async function getSeasons(): Promise<Season[]> {
  const first = await fetchApi<{
    total: string;
    SeasonTable: { Seasons: Season[] };
  }>("/seasons.json?limit=100&offset=0");

  const total = parseInt(first.total, 10);
  const seasons = [...first.SeasonTable.Seasons];

  const remaining = Math.ceil((total - 100) / 100);
  for (let i = 1; i <= remaining; i++) {
    const page = await fetchApi<{ SeasonTable: { Seasons: Season[] } }>(
      `/seasons.json?limit=100&offset=${i * 100}`
    );
    seasons.push(...page.SeasonTable.Seasons);
  }

  return seasons;
}

export async function getRaces(year: string): Promise<Race[]> {
  const data = await fetchApi<{ RaceTable: { Races: Race[] } }>(
    `/${year}.json`
  );
  return data.RaceTable.Races;
}

export async function getRaceResults(
  year: string,
  round: string
): Promise<RaceWithResults | null> {
  const data = await fetchApi<{ RaceTable: { Races: RaceWithResults[] } }>(
    `/${year}/${round}/results.json`
  );
  return data.RaceTable.Races[0] ?? null;
}

export async function getDriverStandings(
  year: string
): Promise<DriverStanding[]> {
  const data = await fetchApi<{
    StandingsTable: {
      StandingsLists: { DriverStandings: DriverStanding[] }[];
    };
  }>(`/${year}/driverStandings.json`);
  return data.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];
}

export async function getConstructorStandings(
  year: string
): Promise<ConstructorStanding[]> {
  const data = await fetchApi<{
    StandingsTable: {
      StandingsLists: {
        ConstructorStandings: ConstructorStanding[];
      }[];
    };
  }>(`/${year}/constructorStandings.json`);
  return data.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? [];
}

const API_PAGE_LIMIT = 100;

export async function getAllDrivers(): Promise<Driver[]> {
  const first = await fetchApi<{
    total: string;
    DriverTable: { Drivers: Driver[] };
  }>(`/drivers.json?limit=${API_PAGE_LIMIT}&offset=0`);

  const total = parseInt(first.total, 10);
  const drivers = [...first.DriverTable.Drivers];

  const remaining = Math.ceil((total - API_PAGE_LIMIT) / API_PAGE_LIMIT);
  for (let i = 1; i <= remaining; i++) {
    const offset = i * API_PAGE_LIMIT;
    const page = await fetchApi<{
      DriverTable: { Drivers: Driver[] };
    }>(`/drivers.json?limit=${API_PAGE_LIMIT}&offset=${offset}`);
    drivers.push(...page.DriverTable.Drivers);
  }

  return drivers;
}

export async function getAllCircuits(): Promise<Circuit[]> {
  const data = await fetchApi<{
    CircuitTable: { Circuits: Circuit[] };
  }>("/circuits.json?limit=100&offset=0");
  return data.CircuitTable.Circuits;
}

export async function getCurrentCircuitIds(): Promise<Set<string>> {
  const data = await fetchApi<{ CircuitTable: { Circuits: Circuit[] } }>(
    "/current/circuits.json"
  );
  return new Set(data.CircuitTable.Circuits.map((c) => c.circuitId));
}

export async function getRace(
  year: string,
  round: string
): Promise<Race | null> {
  const data = await fetchApi<{ RaceTable: { Races: Race[] } }>(
    `/${year}/${round}.json`
  );
  return data.RaceTable.Races[0] ?? null;
}

export async function getQualifyingResults(
  year: string,
  round: string
): Promise<QualifyingResult[]> {
  const data = await fetchApi<{
    RaceTable: { Races: { QualifyingResults?: QualifyingResult[] }[] };
  }>(`/${year}/${round}/qualifying.json`);
  return data.RaceTable.Races[0]?.QualifyingResults ?? [];
}

export async function getSprintResults(
  year: string,
  round: string
): Promise<RaceResult[]> {
  const data = await fetchApi<{
    RaceTable: { Races: { SprintResults?: RaceResult[] }[] };
  }>(`/${year}/${round}/sprint.json`);
  return data.RaceTable.Races[0]?.SprintResults ?? [];
}

export async function getPitStops(
  year: string,
  round: string
): Promise<PitStop[]> {
  const data = await fetchApi<{
    RaceTable: { Races: { PitStops?: PitStop[] }[] };
  }>(`/${year}/${round}/pitstops.json?limit=100`);
  return data.RaceTable.Races[0]?.PitStops ?? [];
}

export async function getDriver(driverId: string): Promise<Driver | null> {
  const data = await fetchApi<{ DriverTable: { Drivers: Driver[] } }>(
    `/drivers/${driverId}.json`
  );
  return data.DriverTable.Drivers[0] ?? null;
}

export async function getDriverSeasons(driverId: string): Promise<Season[]> {
  const data = await fetchApi<{ SeasonTable: { Seasons: Season[] } }>(
    `/drivers/${driverId}/seasons.json`
  );
  return data.SeasonTable.Seasons;
}

export async function getCurrentDriverIds(): Promise<Set<string>> {
  const data = await fetchApi<{ DriverTable: { Drivers: Driver[] } }>(
    "/current/drivers.json"
  );
  return new Set(data.DriverTable.Drivers.map((d) => d.driverId));
}

export interface DriverStats {
  races: number;
  wins: number;
  podiums: number;
  seasons: number;
}

export async function getDriverStats(driverId: string): Promise<DriverStats> {
  const [racesData, winsData, p2Data, p3Data, seasonsData] = await Promise.all([
    fetchApi<{ total: string }>(`/drivers/${driverId}/results.json?limit=0`),
    fetchApi<{ total: string }>(`/drivers/${driverId}/results/1.json?limit=0`),
    fetchApi<{ total: string }>(`/drivers/${driverId}/results/2.json?limit=0`),
    fetchApi<{ total: string }>(`/drivers/${driverId}/results/3.json?limit=0`),
    fetchApi<{ SeasonTable: { Seasons: Season[] } }>(
      `/drivers/${driverId}/seasons.json`
    ),
  ]);

  const wins = parseInt(winsData.total, 10);
  const p2 = parseInt(p2Data.total, 10);
  const p3 = parseInt(p3Data.total, 10);

  return {
    races: parseInt(racesData.total, 10),
    wins,
    podiums: wins + p2 + p3,
    seasons: seasonsData.SeasonTable.Seasons.length,
  };
}
