import { Link } from "react-router-dom";
import { getSeasons } from "../lib/api";
import type { Season } from "../lib/types";
import { useFetch } from "../lib/useFetch";
import { usePageTitle } from "../lib/usePageTitle";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

export default function Seasons() {
  usePageTitle("All Seasons");
  const { data: seasons, loading, error } = useFetch<Season[]>(getSeasons);

  const sorted = seasons ? [...seasons].sort((a, b) => +b.season - +a.season) : [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">All Seasons</h1>

      {error && <ErrorMessage message={error} />}
      {loading && <Loader />}

      {!loading && !error && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {sorted.map((s) => (
            <Link
              key={s.season}
              to={`/season/${s.season}`}
              className="rounded-lg border border-f1-border bg-f1-surface px-3 py-4 text-center font-mono text-lg font-bold hover:border-f1-red/50 hover:bg-f1-surface-hover transition-colors"
            >
              {s.season}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
