import { useParams, Link } from "react-router-dom";
import { getDriver, getDriverSeasons, getDriverStats, getCurrentDriverIds } from "../lib/api";
import type { Driver as DriverType, Season } from "../lib/types";
import type { DriverStats } from "../lib/api";
import { useFetch } from "../lib/useFetch";
import { usePageTitle } from "../lib/usePageTitle";
import { getChampionRecord } from "../lib/champions";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import PinButton from "../components/PinButton";
import DriverLabels from "../components/DriverLabels";
import DriverPhoto from "../components/DriverPhoto";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-f1-border bg-f1-surface px-4 py-3 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-f1-text-muted">{label}</p>
    </div>
  );
}

export default function Driver() {
  const { driverId } = useParams<{ driverId: string }>();

  const { data: driver, loading: dl, error: de } = useFetch<DriverType | null>(
    () => getDriver(driverId!),
    [driverId]
  );
  const { data: seasons, loading: sl, error: se } = useFetch<Season[]>(
    () => getDriverSeasons(driverId!),
    [driverId]
  );
  const { data: stats, loading: stl } = useFetch<DriverStats>(
    () => getDriverStats(driverId!),
    [driverId]
  );
  const { data: activeIds } = useFetch<Set<string>>(getCurrentDriverIds);

  usePageTitle(driver ? `${driver.givenName} ${driver.familyName}` : "Driver");

  const loading = dl || sl;
  const error = de || se;
  const champion = driverId ? getChampionRecord(driverId) : undefined;
  const isActive = activeIds?.has(driverId!) ?? false;

  return (
    <div>
      <div className="mb-1">
        <Link
          to="/drivers"
          className="text-sm text-f1-text-muted hover:text-f1-red transition-colors"
        >
          &larr; All Drivers
        </Link>
      </div>

      {error && <ErrorMessage message={error} />}
      {loading && <Loader />}

      {!loading && !error && driver && (
        <>
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="flex gap-4">
              <DriverPhoto
                wikipediaUrl={driver.url}
                name={`${driver.givenName} ${driver.familyName}`}
                size="lg"
              />
              <div>
              <h1 className="text-2xl font-bold">
                {driver.givenName} {driver.familyName}
              </h1>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-f1-text-muted">
                <span>{driver.nationality}</span>
                <span>&middot;</span>
                <span>Born {driver.dateOfBirth}</span>
                {driver.permanentNumber && (
                  <>
                    <span>&middot;</span>
                    <span>#{driver.permanentNumber}</span>
                  </>
                )}
                {driver.code && (
                  <>
                    <span>&middot;</span>
                    <span>{driver.code}</span>
                  </>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <DriverLabels
                  driverId={driver.driverId}
                  isActive={isActive}
                  wins={stats?.wins}
                />
                {champion && (
                  <span className="text-xs text-amber-400/70">
                    ({champion.years.join(", ")})
                  </span>
                )}
              </div>
              <a
                href={driver.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm text-f1-red hover:underline"
              >
                Wikipedia &rarr;
              </a>
              </div>
            </div>
            <PinButton
              driver={{
                driverId: driver.driverId,
                givenName: driver.givenName,
                familyName: driver.familyName,
                code: driver.code,
                nationality: driver.nationality,
                url: driver.url,
              }}
            />
          </div>

          {stats && !stl && (
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Races" value={stats.races} />
              <StatCard label="Wins" value={stats.wins} />
              <StatCard label="Podiums" value={stats.podiums} />
              <StatCard label="Seasons" value={stats.seasons} />
            </div>
          )}
          {stl && (
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-[72px] animate-pulse rounded-lg border border-f1-border bg-f1-surface"
                />
              ))}
            </div>
          )}

          {seasons && seasons.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-bold">
                Seasons ({seasons.length})
              </h2>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                {[...seasons].reverse().map((s) => (
                  <Link
                    key={s.season}
                    to={`/season/${s.season}`}
                    className="rounded-lg border border-f1-border bg-f1-surface px-2 py-3 text-center font-mono text-sm hover:border-f1-red/50 hover:bg-f1-surface-hover transition-colors"
                  >
                    {s.season}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {!loading && !error && !driver && (
        <p className="text-f1-text-muted">Driver not found.</p>
      )}
    </div>
  );
}
