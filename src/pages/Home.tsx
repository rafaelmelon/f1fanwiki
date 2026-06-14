import { Link } from "react-router-dom";
import { getDriverStandings, getConstructorStandings, getRaces } from "../lib/api";
import type { DriverStanding, ConstructorStanding, Race } from "../lib/types";
import { useFetch } from "../lib/useFetch";
import { DriverStandingsTable, ConstructorStandingsTable } from "../components/StandingsTable";
import { GREATEST_DRIVERS } from "../lib/greatest";
import { usePageTitle } from "../lib/usePageTitle";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

const currentYear = new Date().getFullYear().toString();

function NextRaceCard({ races }: { races: Race[] }) {
  const now = new Date();
  const next = races.find((r) => new Date(`${r.date}T${r.time ?? "00:00:00Z"}`) > now);
  if (!next) return null;

  const raceDate = new Date(`${next.date}T${next.time ?? "00:00:00Z"}`);

  return (
    <Link
      to={`/season/${next.season}/race/${next.round}`}
      className="block rounded-xl border border-f1-border bg-f1-surface p-5 hover:border-f1-red/50 transition-colors"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-f1-red">Next Race</p>
        <span className="text-xs text-f1-text-muted">View weekend &rarr;</span>
      </div>
      <h3 className="mt-1 text-lg font-bold">{next.raceName}</h3>
      <p className="mt-1 text-sm text-f1-text-muted">
        {next.Circuit.circuitName} &middot; {next.Circuit.Location.locality},{" "}
        {next.Circuit.Location.country}
      </p>
      <p className="mt-2 text-sm text-f1-text-muted">
        {raceDate.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </Link>
  );
}

export default function Home() {
  usePageTitle(`${currentYear} Season`);
  const { data: drivers, loading: dl, error: de } = useFetch<DriverStanding[]>(
    () => getDriverStandings(currentYear),
    [currentYear]
  );
  const { data: constructors, loading: cl, error: ce } = useFetch<ConstructorStanding[]>(
    () => getConstructorStandings(currentYear),
    [currentYear]
  );
  const { data: races, loading: rl, error: re } = useFetch<Race[]>(
    () => getRaces(currentYear),
    [currentYear]
  );

  const loading = dl || cl || rl;
  const error = de || ce || re;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          <span className="text-f1-red">F1</span> Wiki
        </h1>
        <p className="mt-1 text-f1-text-muted">
          {currentYear} Season
        </p>
      </div>

      {error && <ErrorMessage message={error} />}
      {loading && <Loader />}

      {!loading && !error && (
        <div className="space-y-8">
          {races && <NextRaceCard races={races} />}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-f1-border bg-f1-surface p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold">Driver Standings</h2>
                <Link
                  to={`/season/${currentYear}`}
                  className="text-xs text-f1-red hover:underline"
                >
                  View all
                </Link>
              </div>
              {drivers && <DriverStandingsTable standings={drivers} compact />}
            </div>

            <div className="rounded-xl border border-f1-border bg-f1-surface p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold">Constructor Standings</h2>
                <Link
                  to={`/season/${currentYear}`}
                  className="text-xs text-f1-red hover:underline"
                >
                  View all
                </Link>
              </div>
              {constructors && (
                <ConstructorStandingsTable standings={constructors} compact />
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              to="/seasons"
              className="group rounded-xl border border-f1-border bg-f1-surface p-5 hover:border-f1-red/50 transition-colors"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-f1-red/10 text-f1-red group-hover:bg-f1-red/20 transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <p className="text-lg font-bold group-hover:text-f1-red transition-colors">All Seasons</p>
              <p className="mt-1 text-sm text-f1-text-muted">
                Every F1 championship from 1950 to {currentYear}. Race calendars, results, and standings.
              </p>
            </Link>
            <Link
              to="/drivers"
              className="group rounded-xl border border-f1-border bg-f1-surface p-5 hover:border-f1-red/50 transition-colors"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 group-hover:bg-sky-500/20 transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <p className="text-lg font-bold group-hover:text-f1-red transition-colors">All Drivers</p>
              <p className="mt-1 text-sm text-f1-text-muted">
                Search and filter 870+ drivers. Sort by name, nationality, or number. Pin favorites to compare.
              </p>
            </Link>
            <Link
              to="/greatest"
              className="group rounded-xl border border-f1-border bg-f1-surface p-5 hover:border-f1-red/50 transition-colors"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <p className="text-lg font-bold group-hover:text-f1-red transition-colors">Greatest Drivers</p>
              <p className="mt-1 text-sm text-f1-text-muted">
                All {GREATEST_DRIVERS.length} World Champions ranked by titles, wins, podiums, poles, and win rate across eras.
              </p>
            </Link>
            <Link
              to="/circuits"
              className="group rounded-xl border border-f1-border bg-f1-surface p-5 hover:border-f1-red/50 transition-colors"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <p className="text-lg font-bold group-hover:text-f1-red transition-colors">Circuits</p>
              <p className="mt-1 text-sm text-f1-text-muted">
                All 78 circuits that have hosted a Grand Prix. Filter by country and active/historic status.
              </p>
            </Link>
            <Link
              to="/compare"
              className="group rounded-xl border border-f1-border bg-f1-surface p-5 hover:border-f1-red/50 transition-colors"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <p className="text-lg font-bold group-hover:text-f1-red transition-colors">Compare Drivers</p>
              <p className="mt-1 text-sm text-f1-text-muted">
                Pin your favorite drivers and compare their career stats side by side.
              </p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
