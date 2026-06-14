import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { GREATEST_DRIVERS, type GreatestDriver } from "../lib/greatest";
import DriverPhoto from "../components/DriverPhoto";
import PinButton from "../components/PinButton";
import SortableHeader, { type SortDir } from "../components/SortableHeader";
import { usePageTitle } from "../lib/usePageTitle";

type SortKey = "titles" | "wins" | "podiums" | "poles" | "races" | "name" | "winRate";

function TitleStars({ count }: { count: number }) {
  return (
    <span className="inline-flex gap-px">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="text-amber-400 text-xs">★</span>
      ))}
    </span>
  );
}

function winRate(d: GreatestDriver): number {
  return d.races > 0 ? (d.wins / d.races) * 100 : 0;
}

export default function Greatest() {
  usePageTitle("Greatest Drivers");
  const [sortKey, setSortKey] = useState<SortKey>("titles");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [eraFilter, setEraFilter] = useState("");
  const [search, setSearch] = useState("");

  const toggleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("desc");
      }
    },
    [sortKey]
  );

  const eras = useMemo(() => {
    const set = new Set(GREATEST_DRIVERS.map((d) => d.era));
    return [...set].sort();
  }, []);

  const sorted = useMemo(() => {
    let list = [...GREATEST_DRIVERS];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.givenName.toLowerCase().includes(q) ||
          d.familyName.toLowerCase().includes(q) ||
          d.nationality.toLowerCase().includes(q)
      );
    }

    if (eraFilter) {
      list = list.filter((d) => d.era === eraFilter);
    }

    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      switch (sortKey) {
        case "name":
          return a.familyName.localeCompare(b.familyName) * dir;
        case "titles":
          return (a.titles - b.titles || a.wins - b.wins) * dir;
        case "wins":
          return (a.wins - b.wins) * dir;
        case "podiums":
          return (a.podiums - b.podiums) * dir;
        case "poles":
          return (a.poles - b.poles) * dir;
        case "races":
          return (a.races - b.races) * dir;
        case "winRate":
          return (winRate(a) - winRate(b)) * dir;
        default:
          return 0;
      }
    });

    return list;
  }, [search, eraFilter, sortKey, sortDir]);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Greatest Drivers</h1>
      <p className="mb-6 text-sm text-f1-text-muted">
        All {GREATEST_DRIVERS.length} Formula 1 World Champions ranked by career achievements
      </p>

      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name or nationality..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 rounded-lg border border-f1-border bg-f1-surface px-4 py-2 text-sm text-f1-text placeholder:text-f1-text-muted focus:border-f1-red focus:outline-none"
        />
        <select
          value={eraFilter}
          onChange={(e) => setEraFilter(e.target.value)}
          className="rounded-lg border border-f1-border bg-f1-surface px-3 py-2 text-sm text-f1-text focus:border-f1-red focus:outline-none"
        >
          <option value="">All Eras</option>
          {eras.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-f1-border text-left text-f1-text-muted">
              <th className="px-3 py-2.5 w-8 text-xs uppercase tracking-wider">#</th>
              <SortableHeader label="Driver" active={sortKey === "name"} dir={sortDir} onSort={() => toggleSort("name")} />
              <SortableHeader label="Titles" active={sortKey === "titles"} dir={sortDir} onSort={() => toggleSort("titles")} />
              <SortableHeader label="Wins" active={sortKey === "wins"} dir={sortDir} onSort={() => toggleSort("wins")} />
              <SortableHeader label="Podiums" active={sortKey === "podiums"} dir={sortDir} onSort={() => toggleSort("podiums")} className="hidden sm:table-cell" />
              <SortableHeader label="Poles" active={sortKey === "poles"} dir={sortDir} onSort={() => toggleSort("poles")} className="hidden md:table-cell" />
              <SortableHeader label="Races" active={sortKey === "races"} dir={sortDir} onSort={() => toggleSort("races")} className="hidden md:table-cell" />
              <SortableHeader label="Win %" active={sortKey === "winRate"} dir={sortDir} onSort={() => toggleSort("winRate")} className="hidden lg:table-cell" />
              <th className="px-3 py-2.5 hidden lg:table-cell text-xs uppercase tracking-wider text-f1-text-muted">
                Championships
              </th>
              <th className="px-3 py-2.5 text-right w-16"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={10} className="px-3 py-8 text-center text-f1-text-muted">
                  No drivers match your search.
                </td>
              </tr>
            )}
            {sorted.map((d, i) => (
              <tr
                key={d.driverId}
                className="border-b border-f1-border/50 hover:bg-f1-surface-hover transition-colors"
              >
                <td className="px-3 py-2.5 text-f1-text-muted font-mono text-xs">
                  {i + 1}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <DriverPhoto
                      wikipediaUrl={`https://en.wikipedia.org/wiki/${d.givenName}_${d.familyName}`}
                      name={`${d.givenName} ${d.familyName}`}
                      size="sm"
                    />
                    <div>
                      <Link
                        to={`/driver/${d.driverId}`}
                        className="font-medium hover:text-f1-red transition-colors"
                      >
                        {d.givenName} {d.familyName}
                      </Link>
                      <div className="text-xs text-f1-text-muted">{d.nationality}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <TitleStars count={d.titles} />
                </td>
                <td className="px-3 py-2.5 font-semibold tabular-nums">{d.wins}</td>
                <td className="px-3 py-2.5 tabular-nums hidden sm:table-cell">{d.podiums}</td>
                <td className="px-3 py-2.5 tabular-nums hidden md:table-cell">{d.poles}</td>
                <td className="px-3 py-2.5 tabular-nums text-f1-text-muted hidden md:table-cell">{d.races}</td>
                <td className="px-3 py-2.5 tabular-nums text-f1-text-muted hidden lg:table-cell">
                  {winRate(d).toFixed(1)}%
                </td>
                <td className="px-3 py-2.5 hidden lg:table-cell">
                  <span className="text-xs text-f1-text-muted">
                    {d.championshipYears.join(", ")}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <PinButton
                    driver={{
                      driverId: d.driverId,
                      givenName: d.givenName,
                      familyName: d.familyName,
                      nationality: d.nationality,
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-xs text-f1-text-muted">
        Active drivers' career stats updated through the 2025 season; retired drivers are final. Click any driver name for live stats from the API.
      </p>
    </div>
  );
}
