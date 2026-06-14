import { useParams, Link } from "react-router-dom";
import { getRaces, getDriverStandings, getConstructorStandings } from "../lib/api";
import type { Race, DriverStanding, ConstructorStanding } from "../lib/types";
import { useFetch } from "../lib/useFetch";
import { usePageTitle } from "../lib/usePageTitle";
import { DriverStandingsTable, ConstructorStandingsTable } from "../components/StandingsTable";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

export default function Season() {
  const { year } = useParams<{ year: string }>();
  usePageTitle(`${year} Season`);

  const { data: races, loading: rl, error: re } = useFetch<Race[]>(
    () => getRaces(year!),
    [year]
  );
  const { data: drivers, loading: dl, error: de } = useFetch<DriverStanding[]>(
    () => getDriverStandings(year!),
    [year]
  );
  const { data: constructors, loading: cl, error: ce } = useFetch<ConstructorStanding[]>(
    () => getConstructorStandings(year!),
    [year]
  );

  const loading = rl || dl || cl;
  const error = re || de || ce;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{year} Season</h1>

      {error && <ErrorMessage message={error} />}
      {loading && <Loader />}

      {!loading && !error && (
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-lg font-bold">Race Calendar</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-f1-border text-left text-f1-text-muted">
                    <th className="px-3 py-2 w-12">Rd</th>
                    <th className="px-3 py-2">Race</th>
                    <th className="px-3 py-2 hidden sm:table-cell">Circuit</th>
                    <th className="px-3 py-2 text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {races?.map((r) => (
                    <tr
                      key={r.round}
                      className="border-b border-f1-border/50 hover:bg-f1-surface-hover transition-colors"
                    >
                      <td className="px-3 py-2 text-f1-text-muted">{r.round}</td>
                      <td className="px-3 py-2">
                        <Link
                          to={`/season/${year}/race/${r.round}`}
                          className="hover:text-f1-red transition-colors"
                        >
                          {r.raceName}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-f1-text-muted hidden sm:table-cell">
                        {r.Circuit.Location.locality}, {r.Circuit.Location.country}
                      </td>
                      <td className="px-3 py-2 text-right text-f1-text-muted">
                        {new Date(r.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-f1-border bg-f1-surface p-5">
              <h2 className="mb-4 font-bold">Driver Championship</h2>
              {drivers && <DriverStandingsTable standings={drivers} />}
            </section>

            <section className="rounded-xl border border-f1-border bg-f1-surface p-5">
              <h2 className="mb-4 font-bold">Constructor Championship</h2>
              {constructors && <ConstructorStandingsTable standings={constructors} />}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
