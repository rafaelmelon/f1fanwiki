import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAllDrivers, getCurrentDriverIds } from "../lib/api";
import type { Driver } from "../lib/types";
import { useFetch } from "../lib/useFetch";
import { CHAMPION_DRIVER_IDS } from "../lib/champions";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import PinButton from "../components/PinButton";
import DriverLabels from "../components/DriverLabels";
import SortableHeader, { type SortDir } from "../components/SortableHeader";
import { usePageTitle } from "../lib/usePageTitle";

const PAGE_SIZE = 50;

type StatusFilter = "all" | "active" | "champion";
type SortKey = "name" | "code" | "nationality" | "dob" | "number";

const selectClass =
  "rounded-lg border border-f1-border bg-f1-surface px-3 py-2 text-sm text-f1-text focus:border-f1-red focus:outline-none";

function compareDob(a: string | undefined, b: string | undefined): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a.localeCompare(b);
}

function compareNum(a: string | undefined, b: string | undefined): number {
  const na = a ? parseInt(a, 10) : Infinity;
  const nb = b ? parseInt(b, 10) : Infinity;
  return na - nb;
}

export default function Drivers() {
  usePageTitle("Drivers");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [nationalityFilter, setNationalityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [decadeFilter, setDecadeFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const { data: allDrivers, loading, error } = useFetch<Driver[]>(getAllDrivers);
  const { data: activeIds } = useFetch<Set<string>>(getCurrentDriverIds);

  const toggleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
      setPage(1);
    },
    [sortKey]
  );

  const nationalities = useMemo(() => {
    if (!allDrivers) return [];
    const set = new Set(allDrivers.map((d) => d.nationality).filter(Boolean));
    return [...set].sort();
  }, [allDrivers]);

  const decades = useMemo(() => {
    if (!allDrivers) return [];
    const set = new Set(
      allDrivers
        .filter((d) => d.dateOfBirth)
        .map((d) => {
          const y = parseInt(d.dateOfBirth.slice(0, 4), 10);
          return (Math.floor(y / 10) * 10).toString();
        })
    );
    return [...set].sort();
  }, [allDrivers]);

  const filtered = useMemo(() => {
    if (!allDrivers) return null;
    return allDrivers.filter((d) => {
      if (search) {
        const q = search.toLowerCase();
        const matches =
          d.givenName?.toLowerCase().includes(q) ||
          d.familyName?.toLowerCase().includes(q) ||
          (d.nationality?.toLowerCase().includes(q) ?? false) ||
          (d.code?.toLowerCase().includes(q) ?? false) ||
          (d.permanentNumber?.includes(q) ?? false);
        if (!matches) return false;
      }
      if (nationalityFilter && d.nationality !== nationalityFilter) return false;
      if (statusFilter === "active" && !activeIds?.has(d.driverId)) return false;
      if (statusFilter === "champion" && !CHAMPION_DRIVER_IDS.has(d.driverId)) return false;
      if (decadeFilter) {
        if (!d.dateOfBirth) return false;
        const decade = Math.floor(parseInt(d.dateOfBirth.slice(0, 4), 10) / 10) * 10;
        if (decade.toString() !== decadeFilter) return false;
      }
      return true;
    });
  }, [allDrivers, search, nationalityFilter, statusFilter, decadeFilter, activeIds]);

  const sorted = useMemo(() => {
    if (!filtered) return null;
    const copy = [...filtered];
    const dir = sortDir === "asc" ? 1 : -1;
    copy.sort((a, b) => {
      switch (sortKey) {
        case "name": {
          const cmp = a.familyName.localeCompare(b.familyName) || a.givenName.localeCompare(b.givenName);
          return cmp * dir;
        }
        case "code":
          return ((a.code ?? "ZZZ").localeCompare(b.code ?? "ZZZ")) * dir;
        case "nationality":
          return ((a.nationality ?? "").localeCompare(b.nationality ?? "")) * dir;
        case "dob":
          return compareDob(a.dateOfBirth, b.dateOfBirth) * dir;
        case "number":
          return compareNum(a.permanentNumber, b.permanentNumber) * dir;
        default:
          return 0;
      }
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const totalFiltered = sorted?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = sorted?.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE) ?? [];

  const hasActiveFilters = search || nationalityFilter || statusFilter !== "all" || decadeFilter;

  const resetPage = () => setPage(1);

  const clearFilters = () => {
    setSearch("");
    setNationalityFilter("");
    setStatusFilter("all");
    setDecadeFilter("");
    resetPage();
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Drivers</h1>

      <div className="mb-6 space-y-3">
        <input
          type="text"
          placeholder="Search by name, code, nationality, or number..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            resetPage();
          }}
          className="w-full rounded-lg border border-f1-border bg-f1-surface px-4 py-2 text-sm text-f1-text placeholder:text-f1-text-muted focus:border-f1-red focus:outline-none"
        />

        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusFilter);
              resetPage();
            }}
            className={selectClass}
          >
            <option value="all">All Status</option>
            <option value="active">Active Drivers</option>
            <option value="champion">World Champions</option>
          </select>

          <select
            value={nationalityFilter}
            onChange={(e) => {
              setNationalityFilter(e.target.value);
              resetPage();
            }}
            className={selectClass}
          >
            <option value="">All Nationalities</option>
            {nationalities.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <select
            value={decadeFilter}
            onChange={(e) => {
              setDecadeFilter(e.target.value);
              resetPage();
            }}
            className={selectClass}
          >
            <option value="">All Decades (DOB)</option>
            {decades.map((d) => (
              <option key={d} value={d}>
                {d}s
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="rounded-lg border border-f1-border px-3 py-2 text-sm text-f1-text-muted hover:text-f1-red hover:border-f1-red/50 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {error && <ErrorMessage message={error} />}
      {loading && <Loader />}

      {!loading && !error && sorted && (
        <>
          <p className="mb-3 text-xs text-f1-text-muted">
            {totalFiltered} driver{totalFiltered !== 1 ? "s" : ""} found
            {allDrivers && totalFiltered < allDrivers.length
              ? ` (filtered from ${allDrivers.length})`
              : ""}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-f1-border text-left text-f1-text-muted text-xs uppercase tracking-wider">
                  <SortableHeader label="Name" active={sortKey === "name"} dir={sortDir} onSort={() => toggleSort("name")} />
                  <SortableHeader label="Code" active={sortKey === "code"} dir={sortDir} onSort={() => toggleSort("code")} className="hidden lg:table-cell" />
                  <th className="px-3 py-2.5 hidden md:table-cell">Labels</th>
                  <SortableHeader label="Nationality" active={sortKey === "nationality"} dir={sortDir} onSort={() => toggleSort("nationality")} />
                  <SortableHeader label="DOB" active={sortKey === "dob"} dir={sortDir} onSort={() => toggleSort("dob")} className="hidden sm:table-cell" />
                  <SortableHeader label="No." active={sortKey === "number"} dir={sortDir} onSort={() => toggleSort("number")} className="hidden sm:table-cell" align="right" />
                  <th className="px-3 py-2.5 text-right w-20"></th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-f1-text-muted">
                      No drivers match the current filters.
                    </td>
                  </tr>
                )}
                {paged.map((d) => (
                  <tr
                    key={d.driverId}
                    className="border-b border-f1-border/50 hover:bg-f1-surface-hover transition-colors"
                  >
                    <td className="px-3 py-2">
                      <Link
                        to={`/driver/${d.driverId}`}
                        className="hover:text-f1-red transition-colors"
                      >
                        {d.givenName} {d.familyName}
                      </Link>
                      <span className="ml-2 inline md:hidden">
                        <DriverLabels
                          driverId={d.driverId}
                          isActive={activeIds?.has(d.driverId) ?? false}
                        />
                      </span>
                    </td>
                    <td className="px-3 py-2 text-f1-text-muted hidden lg:table-cell">
                      {d.code ?? "-"}
                    </td>
                    <td className="px-3 py-2 hidden md:table-cell">
                      <DriverLabels
                        driverId={d.driverId}
                        isActive={activeIds?.has(d.driverId) ?? false}
                      />
                    </td>
                    <td className="px-3 py-2 text-f1-text-muted">{d.nationality}</td>
                    <td className="px-3 py-2 text-f1-text-muted hidden sm:table-cell">
                      {d.dateOfBirth}
                    </td>
                    <td className="px-3 py-2 text-right text-f1-text-muted hidden sm:table-cell">
                      {d.permanentNumber ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <PinButton
                        driver={{
                          driverId: d.driverId,
                          givenName: d.givenName,
                          familyName: d.familyName,
                          code: d.code,
                          nationality: d.nationality,
                          url: d.url,
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between text-sm">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="rounded-lg border border-f1-border px-4 py-2 hover:bg-f1-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center gap-2 text-f1-text-muted">
                <span>Page</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={safePage}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (v >= 1 && v <= totalPages) setPage(v);
                  }}
                  className="w-14 rounded border border-f1-border bg-f1-surface px-2 py-1 text-center text-sm text-f1-text focus:border-f1-red focus:outline-none"
                />
                <span>of {totalPages}</span>
              </div>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={safePage >= totalPages}
                className="rounded-lg border border-f1-border px-4 py-2 hover:bg-f1-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
