export interface GreatestDriver {
  driverId: string;
  givenName: string;
  familyName: string;
  nationality: string;
  titles: number;
  wins: number;
  podiums: number;
  poles: number;
  races: number;
  championshipYears: number[];
  era: string;
}

export const GREATEST_DRIVERS: GreatestDriver[] = [
  { driverId: "max_verstappen", givenName: "Max", familyName: "Verstappen", nationality: "Dutch", titles: 4, wins: 71, podiums: 128, poles: 64, races: 239, championshipYears: [2021, 2022, 2023, 2024], era: "2010s–present" },
  { driverId: "hamilton", givenName: "Lewis", familyName: "Hamilton", nationality: "British", titles: 7, wins: 105, podiums: 205, poles: 118, races: 386, championshipYears: [2008, 2014, 2015, 2017, 2018, 2019, 2020], era: "2000s–present" },
  { driverId: "michael_schumacher", givenName: "Michael", familyName: "Schumacher", nationality: "German", titles: 7, wins: 91, podiums: 155, poles: 68, races: 308, championshipYears: [1994, 1995, 2000, 2001, 2002, 2003, 2004], era: "1990s–2000s" },
  { driverId: "vettel", givenName: "Sebastian", familyName: "Vettel", nationality: "German", titles: 4, wins: 53, podiums: 122, poles: 57, races: 300, championshipYears: [2010, 2011, 2012, 2013], era: "2000s–2020s" },
  { driverId: "fangio", givenName: "Juan Manuel", familyName: "Fangio", nationality: "Argentine", titles: 5, wins: 24, podiums: 35, poles: 29, races: 52, championshipYears: [1951, 1954, 1955, 1956, 1957], era: "1950s" },
  { driverId: "prost", givenName: "Alain", familyName: "Prost", nationality: "French", titles: 4, wins: 51, podiums: 106, poles: 33, races: 199, championshipYears: [1985, 1986, 1989, 1993], era: "1980s–1990s" },
  { driverId: "senna", givenName: "Ayrton", familyName: "Senna", nationality: "Brazilian", titles: 3, wins: 41, podiums: 80, poles: 65, races: 161, championshipYears: [1988, 1990, 1991], era: "1980s–1990s" },
  { driverId: "lauda", givenName: "Niki", familyName: "Lauda", nationality: "Austrian", titles: 3, wins: 25, podiums: 54, poles: 24, races: 171, championshipYears: [1975, 1977, 1984], era: "1970s–1980s" },
  { driverId: "stewart", givenName: "Jackie", familyName: "Stewart", nationality: "British", titles: 3, wins: 27, podiums: 43, poles: 17, races: 99, championshipYears: [1969, 1971, 1973], era: "1960s–1970s" },
  { driverId: "piquet", givenName: "Nelson", familyName: "Piquet", nationality: "Brazilian", titles: 3, wins: 23, podiums: 60, poles: 24, races: 204, championshipYears: [1981, 1983, 1987], era: "1980s" },
  { driverId: "jack_brabham", givenName: "Jack", familyName: "Brabham", nationality: "Australian", titles: 3, wins: 14, podiums: 31, poles: 13, races: 126, championshipYears: [1959, 1960, 1966], era: "1950s–1960s" },
  { driverId: "norris", givenName: "Lando", familyName: "Norris", nationality: "British", titles: 1, wins: 11, podiums: 45, poles: 29, races: 158, championshipYears: [2025], era: "2010s–present" },
  { driverId: "alonso", givenName: "Fernando", familyName: "Alonso", nationality: "Spanish", titles: 2, wins: 32, podiums: 106, poles: 23, races: 434, championshipYears: [2005, 2006], era: "2000s–present" },
  { driverId: "clark", givenName: "Jim", familyName: "Clark", nationality: "British", titles: 2, wins: 25, podiums: 32, poles: 33, races: 72, championshipYears: [1963, 1965], era: "1960s" },
  { driverId: "ascari", givenName: "Alberto", familyName: "Ascari", nationality: "Italian", titles: 2, wins: 13, podiums: 17, poles: 14, races: 32, championshipYears: [1952, 1953], era: "1950s" },
  { driverId: "graham_hill", givenName: "Graham", familyName: "Hill", nationality: "British", titles: 2, wins: 14, podiums: 36, poles: 13, races: 176, championshipYears: [1962, 1968], era: "1960s" },
  { driverId: "hakkinen", givenName: "Mika", familyName: "Häkkinen", nationality: "Finnish", titles: 2, wins: 20, podiums: 51, poles: 26, races: 161, championshipYears: [1998, 1999], era: "1990s" },
  { driverId: "emerson_fittipaldi", givenName: "Emerson", familyName: "Fittipaldi", nationality: "Brazilian", titles: 2, wins: 14, podiums: 35, poles: 6, races: 144, championshipYears: [1972, 1974], era: "1970s" },
  { driverId: "mansell", givenName: "Nigel", familyName: "Mansell", nationality: "British", titles: 1, wins: 31, podiums: 59, poles: 32, races: 187, championshipYears: [1992], era: "1980s–1990s" },
  { driverId: "raikkonen", givenName: "Kimi", familyName: "Räikkönen", nationality: "Finnish", titles: 1, wins: 21, podiums: 103, poles: 18, races: 349, championshipYears: [2007], era: "2000s–2020s" },
  { driverId: "nico_rosberg", givenName: "Nico", familyName: "Rosberg", nationality: "German", titles: 1, wins: 23, podiums: 57, poles: 30, races: 206, championshipYears: [2016], era: "2000s–2010s" },
  { driverId: "damon_hill", givenName: "Damon", familyName: "Hill", nationality: "British", titles: 1, wins: 22, podiums: 42, poles: 20, races: 115, championshipYears: [1996], era: "1990s" },
  { driverId: "button", givenName: "Jenson", familyName: "Button", nationality: "British", titles: 1, wins: 15, podiums: 50, poles: 8, races: 306, championshipYears: [2009], era: "2000s–2010s" },
  { driverId: "andretti", givenName: "Mario", familyName: "Andretti", nationality: "American", titles: 1, wins: 12, podiums: 19, poles: 18, races: 128, championshipYears: [1978], era: "1970s" },
  { driverId: "jones", givenName: "Alan", familyName: "Jones", nationality: "Australian", titles: 1, wins: 12, podiums: 24, poles: 6, races: 116, championshipYears: [1980], era: "1970s–1980s" },
  { driverId: "villeneuve", givenName: "Jacques", familyName: "Villeneuve", nationality: "Canadian", titles: 1, wins: 11, podiums: 23, poles: 13, races: 163, championshipYears: [1997], era: "1990s–2000s" },
  { driverId: "hunt", givenName: "James", familyName: "Hunt", nationality: "British", titles: 1, wins: 10, podiums: 23, poles: 14, races: 92, championshipYears: [1976], era: "1970s" },
  { driverId: "scheckter", givenName: "Jody", familyName: "Scheckter", nationality: "South African", titles: 1, wins: 10, podiums: 25, poles: 3, races: 112, championshipYears: [1979], era: "1970s" },
  { driverId: "hulme", givenName: "Denny", familyName: "Hulme", nationality: "New Zealander", titles: 1, wins: 8, podiums: 33, poles: 1, races: 112, championshipYears: [1967], era: "1960s–1970s" },
  { driverId: "rindt", givenName: "Jochen", familyName: "Rindt", nationality: "Austrian", titles: 1, wins: 6, podiums: 13, poles: 10, races: 60, championshipYears: [1970], era: "1960s–1970s" },
  { driverId: "surtees", givenName: "John", familyName: "Surtees", nationality: "British", titles: 1, wins: 6, podiums: 24, poles: 8, races: 111, championshipYears: [1964], era: "1960s" },
  { driverId: "farina", givenName: "Nino", familyName: "Farina", nationality: "Italian", titles: 1, wins: 5, podiums: 20, poles: 5, races: 33, championshipYears: [1950], era: "1950s" },
  { driverId: "rosberg", givenName: "Keke", familyName: "Rosberg", nationality: "Finnish", titles: 1, wins: 5, podiums: 17, poles: 5, races: 114, championshipYears: [1982], era: "1980s" },
  { driverId: "hawthorn", givenName: "Mike", familyName: "Hawthorn", nationality: "British", titles: 1, wins: 3, podiums: 18, poles: 4, races: 45, championshipYears: [1958], era: "1950s" },
  { driverId: "phil_hill", givenName: "Phil", familyName: "Hill", nationality: "American", titles: 1, wins: 3, podiums: 16, poles: 6, races: 48, championshipYears: [1961], era: "1950s–1960s" },
];
