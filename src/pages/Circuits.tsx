import { useState, useMemo, useCallback } from "react";
import { getAllCircuits, getCurrentCircuitIds } from "../lib/api";
import type { Circuit } from "../lib/types";
import { useFetch } from "../lib/useFetch";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import SortableHeader, { type SortDir } from "../components/SortableHeader";
import { usePageTitle } from "../lib/usePageTitle";

type SortKey = "name" | "country" | "locality";
type StatusFilter = "all" | "active" | "historic";

const selectClass =
  "rounded-lg border border-f1-border bg-f1-surface px-3 py-2 text-sm text-f1-text focus:border-f1-red focus:outline-none";

export default function Circuits() {
  usePageTitle("Circuits");
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const { data: circuits, loading, error } = useFetch<Circuit[]>(getAllCircuits);
  const { data: activeIds } = useFetch<Set<string>>(getCurrentCircuitIds);

  const toggleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey]
  );

  const countries = useMemo(() => {
    if (!circuits) return [];
    const set = new Set(circuits.map((c) => c.Location.country));
    return [...set].sort();
  }, [circuits]);

  const sorted = useMemo(() => {
    if (!circuits) return null;

    let list = [...circuits];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.circuitName.toLowerCase().includes(q) ||
          c.Location.locality.toLowerCase().includes(q) ||
          c.Location.country.toLowerCase().includes(q)
      );
    }

    if (countryFilter) {
      list = list.filter((c) => c.Location.country === countryFilter);
    }

    if (statusFilter === "active") {
      list = list.filter((c) => activeIds?.has(c.circuitId));
    } else if (statusFilter === "historic") {
      list = list.filter((c) => !activeIds?.has(c.circuitId));
    }

    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      switch (sortKey) {
        case "name":
          return a.circuitName.localeCompare(b.circuitName) * dir;
        case "country":
          return (a.Location.country.localeCompare(b.Location.country) ||
            a.Location.locality.localeCompare(b.Location.locality)) * dir;
        case "locality":
          return a.Location.locality.localeCompare(b.Location.locality) * dir;
        default:
          return 0;
      }
    });

    return list;
  }, [circuits, search, countryFilter, statusFilter, activeIds, sortKey, sortDir]);

  const hasActiveFilters = search || countryFilter || statusFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setCountryFilter("");
    setStatusFilter("all");
  };

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Circuits</h1>
      <p className="mb-6 text-sm text-f1-text-muted">
        All {circuits?.length ?? "..."} circuits that have hosted a Formula 1 race
      </p>

      <div className="mb-6 space-y-3">
        <input
          type="text"
          placeholder="Search by name, city, or country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-f1-border bg-f1-surface px-4 py-2 text-sm text-f1-text placeholder:text-f1-text-muted focus:border-f1-red focus:outline-none"
        />

        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className={selectClass}
          >
            <option value="all">All Circuits</option>
            <option value="active">Active (Current Calendar)</option>
            <option value="historic">Historic (No Longer Used)</option>
          </select>

          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className={selectClass}
          >
            <option value="">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
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
            {sorted.length} circuit{sorted.length !== 1 ? "s" : ""} found
            {circuits && sorted.length < circuits.length
              ? ` (filtered from ${circuits.length})`
              : ""}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-f1-border text-left text-f1-text-muted">
                  <SortableHeader label="Circuit" active={sortKey === "name"} dir={sortDir} onSort={() => toggleSort("name")} />
                  <th className="px-3 py-2.5 hidden sm:table-cell text-xs uppercase tracking-wider">Status</th>
                  <SortableHeader label="City" active={sortKey === "locality"} dir={sortDir} onSort={() => toggleSort("locality")} />
                  <SortableHeader label="Country" active={sortKey === "country"} dir={sortDir} onSort={() => toggleSort("country")} />
                  <th className="px-3 py-2.5 hidden md:table-cell text-xs uppercase tracking-wider text-f1-text-muted">
                    Coordinates
                  </th>
                  <th className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-f1-text-muted">
                    Wiki
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-f1-text-muted">
                      No circuits match the current filters.
                    </td>
                  </tr>
                )}
                {sorted.map((c) => {
                  const isActive = activeIds?.has(c.circuitId) ?? false;
                  return (
                    <tr
                      key={c.circuitId}
                      className="border-b border-f1-border/50 hover:bg-f1-surface-hover transition-colors"
                    >
                      <td className="px-3 py-2.5">
                        <span className="font-medium">{c.circuitName}</span>
                        <span className="ml-2 inline sm:hidden">
                          {isActive && (
                            <span className="rounded-full bg-emerald-900/50 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-800">
                              Active
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 hidden sm:table-cell">
                        {isActive ? (
                          <span className="rounded-full bg-emerald-900/50 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-800">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-zinc-800/50 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 border border-zinc-700">
                            Historic
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-f1-text-muted">{c.Location.locality}</td>
                      <td className="px-3 py-2.5 text-f1-text-muted">{c.Location.country}</td>
                      <td className="px-3 py-2.5 hidden md:table-cell">
                        <a
                          href={`https://www.google.com/maps?q=${c.Location.lat},${c.Location.long}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-f1-text-muted hover:text-f1-red transition-colors"
                          title="Open in Google Maps"
                        >
                          {parseFloat(c.Location.lat).toFixed(2)}°, {parseFloat(c.Location.long).toFixed(2)}°
                        </a>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border border-f1-border px-2 py-1 text-xs text-f1-text-muted hover:border-f1-red/50 hover:text-f1-red transition-colors"
                        >
                          Wikipedia ↗
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
