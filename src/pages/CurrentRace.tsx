import { Navigate } from "react-router-dom";
import { getRaces } from "../lib/api";
import type { Race } from "../lib/types";
import { useFetch } from "../lib/useFetch";
import { usePageTitle } from "../lib/usePageTitle";
import { resolveCurrentRace } from "../lib/sessions";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

const currentYear = new Date().getFullYear().toString();

export default function CurrentRace() {
  usePageTitle("Race Weekend");
  const { data: races, loading, error } = useFetch<Race[]>(
    () => getRaces(currentYear),
    [currentYear]
  );

  if (error) return <ErrorMessage message={error} />;
  if (loading || !races) return <Loader />;

  const resolved = resolveCurrentRace(races);
  if (!resolved) {
    return <p className="text-f1-text-muted">No races scheduled.</p>;
  }

  return (
    <Navigate
      to={`/season/${resolved.race.season}/race/${resolved.race.round}`}
      replace
    />
  );
}
