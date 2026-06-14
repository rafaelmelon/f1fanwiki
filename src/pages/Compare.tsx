import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getDriverStats } from "../lib/api";
import type { DriverStats } from "../lib/api";
import { getPinnedDrivers, unpinDriver, type PinnedDriver } from "../lib/favorites";
import { usePageTitle } from "../lib/usePageTitle";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import DriverPhoto from "../components/DriverPhoto";

interface DriverWithStats extends PinnedDriver {
  stats: DriverStats | null;
  loading: boolean;
}

export default function Compare() {
  usePageTitle("Compare Drivers");
  const [drivers, setDrivers] = useState<DriverWithStats[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const loadDrivers = useCallback(async () => {
    const pinned = getPinnedDrivers();
    if (pinned.length === 0) {
      setDrivers([]);
      setInitialLoad(false);
      return;
    }

    setDrivers(pinned.map((d) => ({ ...d, stats: null, loading: true })));
    setError(null);

    for (const driver of pinned) {
      try {
        const stats = await getDriverStats(driver.driverId);
        setDrivers((prev) =>
          prev.map((d) =>
            d.driverId === driver.driverId ? { ...d, stats, loading: false } : d
          )
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load stats");
        setDrivers((prev) =>
          prev.map((d) =>
            d.driverId === driver.driverId ? { ...d, loading: false } : d
          )
        );
      }
    }
    setInitialLoad(false);
  }, []);

  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  const handleRemove = (driverId: string) => {
    unpinDriver(driverId);
    setDrivers((prev) => prev.filter((d) => d.driverId !== driverId));
  };

  if (initialLoad && drivers.length === 0) {
    return <Loader />;
  }

  if (drivers.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Compare Drivers</h1>
        <p className="text-f1-text-muted mb-6">
          No drivers pinned yet. Go to the{" "}
          <Link to="/drivers" className="text-f1-red hover:underline">
            Drivers
          </Link>{" "}
          page and pin drivers to compare them here.
        </p>
      </div>
    );
  }

  const statRows: { label: string; key: keyof DriverStats }[] = [
    { label: "Races", key: "races" },
    { label: "Wins", key: "wins" },
    { label: "Podiums", key: "podiums" },
    { label: "Seasons", key: "seasons" },
  ];

  const allLoaded = drivers.every((d) => !d.loading);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Compare Drivers</h1>

      {error && <ErrorMessage message={error} />}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-f1-border text-left text-f1-text-muted">
              <th className="px-3 py-2 w-28"></th>
              {drivers.map((d) => (
                <th key={d.driverId} className="px-4 py-4 text-center">
                  <div className="flex flex-col items-center gap-2">
                    {d.url && (
                      <DriverPhoto
                        wikipediaUrl={d.url}
                        name={`${d.givenName} ${d.familyName}`}
                        size="lg"
                      />
                    )}
                    <div>
                      <Link
                        to={`/driver/${d.driverId}`}
                        className="text-f1-text hover:text-f1-red transition-colors font-bold"
                      >
                        {d.givenName} {d.familyName}
                      </Link>
                      {d.code && (
                        <span className="ml-1 text-f1-text-muted font-normal">
                          ({d.code})
                        </span>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-f1-border/50">
              <td className="px-3 py-2 text-f1-text-muted">Nationality</td>
              {drivers.map((d) => (
                <td key={d.driverId} className="px-3 py-2 text-center">
                  {d.nationality}
                </td>
              ))}
            </tr>
            {statRows.map(({ label, key }) => {
              const values = allLoaded
                ? drivers.map((d) => d.stats?.[key] ?? 0)
                : [];
              const maxVal = values.length > 0 ? Math.max(...values) : 0;

              return (
                <tr
                  key={key}
                  className="border-b border-f1-border/50 hover:bg-f1-surface-hover transition-colors"
                >
                  <td className="px-3 py-2 text-f1-text-muted">{label}</td>
                  {drivers.map((d) => {
                    const val = d.stats?.[key] ?? 0;
                    const isBest = allLoaded && val === maxVal && maxVal > 0;
                    return (
                      <td
                        key={d.driverId}
                        className={`px-3 py-2 text-center font-mono ${
                          d.loading
                            ? "text-f1-text-muted"
                            : isBest
                              ? "text-f1-red font-bold"
                              : ""
                        }`}
                      >
                        {d.loading ? "..." : val}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr>
              <td className="px-3 py-3"></td>
              {drivers.map((d) => (
                <td key={d.driverId} className="px-3 py-3 text-center">
                  <button
                    onClick={() => handleRemove(d.driverId)}
                    className="text-xs text-f1-text-muted hover:text-f1-red transition-colors"
                  >
                    Remove
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
