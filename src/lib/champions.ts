export interface ChampionRecord {
  driverId: string;
  titles: number;
  years: number[];
}

export const WORLD_CHAMPIONS: ChampionRecord[] = [
  { driverId: "farina", titles: 1, years: [1950] },
  { driverId: "fangio", titles: 5, years: [1951, 1954, 1955, 1956, 1957] },
  { driverId: "ascari", titles: 2, years: [1952, 1953] },
  { driverId: "hawthorn", titles: 1, years: [1958] },
  { driverId: "jack_brabham", titles: 3, years: [1959, 1960, 1966] },
  { driverId: "phil_hill", titles: 1, years: [1961] },
  { driverId: "graham_hill", titles: 2, years: [1962, 1968] },
  { driverId: "clark", titles: 2, years: [1963, 1965] },
  { driverId: "surtees", titles: 1, years: [1964] },
  { driverId: "hulme", titles: 1, years: [1967] },
  { driverId: "stewart", titles: 3, years: [1969, 1971, 1973] },
  { driverId: "rindt", titles: 1, years: [1970] },
  { driverId: "emerson_fittipaldi", titles: 2, years: [1972, 1974] },
  { driverId: "lauda", titles: 3, years: [1975, 1977, 1984] },
  { driverId: "hunt", titles: 1, years: [1976] },
  { driverId: "andretti", titles: 1, years: [1978] },
  { driverId: "scheckter", titles: 1, years: [1979] },
  { driverId: "jones", titles: 1, years: [1980] },
  { driverId: "piquet", titles: 3, years: [1981, 1983, 1987] },
  { driverId: "rosberg", titles: 1, years: [1982] },
  { driverId: "prost", titles: 4, years: [1985, 1986, 1989, 1993] },
  { driverId: "senna", titles: 3, years: [1988, 1990, 1991] },
  { driverId: "mansell", titles: 1, years: [1992] },
  { driverId: "michael_schumacher", titles: 7, years: [1994, 1995, 2000, 2001, 2002, 2003, 2004] },
  { driverId: "damon_hill", titles: 1, years: [1996] },
  { driverId: "villeneuve", titles: 1, years: [1997] },
  { driverId: "hakkinen", titles: 2, years: [1998, 1999] },
  { driverId: "alonso", titles: 2, years: [2005, 2006] },
  { driverId: "raikkonen", titles: 1, years: [2007] },
  { driverId: "hamilton", titles: 7, years: [2008, 2014, 2015, 2017, 2018, 2019, 2020] },
  { driverId: "button", titles: 1, years: [2009] },
  { driverId: "vettel", titles: 4, years: [2010, 2011, 2012, 2013] },
  { driverId: "nico_rosberg", titles: 1, years: [2016] },
  { driverId: "max_verstappen", titles: 4, years: [2021, 2022, 2023, 2024] },
  { driverId: "norris", titles: 1, years: [2025] },
];

const championsMap = new Map(WORLD_CHAMPIONS.map((c) => [c.driverId, c]));

export function getChampionRecord(driverId: string): ChampionRecord | undefined {
  return championsMap.get(driverId);
}

export function isWorldChampion(driverId: string): boolean {
  return championsMap.has(driverId);
}

export const CHAMPION_DRIVER_IDS = new Set(WORLD_CHAMPIONS.map((c) => c.driverId));
