import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getRace,
  getRaceResults,
  getQualifyingResults,
  getSprintResults,
  getPitStops,
  invalidateCache,
} from "../lib/api";
import type {
  Race as RaceType,
  RaceWithResults,
  RaceResult,
  QualifyingResult,
  PitStop,
} from "../lib/types";
import { useFetch } from "../lib/useFetch";
import { usePageTitle } from "../lib/usePageTitle";
import { getRaceSessions, getWeekendInfo, type WeekendSession } from "../lib/sessions";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

const REFRESH_MS = 60_000;

function useClock(intervalMs: number): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function formatCountdown(target: Date, now: Date): string {
  let s = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  const d = Math.floor(s / 86400);
  s -= d * 86400;
  const h = Math.floor(s / 3600);
  s -= h * 3600;
  const m = Math.floor(s / 60);
  s -= m * 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (d > 0) return `${d}d ${pad(h)}h ${pad(m)}m`;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function formatSessionTime(start: Date | null): string {
  if (!start) return "TBC";
  return start.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusDot({ status }: { status: WeekendSession["status"] }) {
  if (status === "live") {
    return (
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-f1-red opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-f1-red" />
      </span>
    );
  }
  if (status === "done") {
    return <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />;
  }
  return <span className="inline-flex h-2.5 w-2.5 rounded-full border border-f1-border bg-f1-surface" />;
}

function SessionRow({
  session,
  now,
  clickable,
  onSelect,
}: {
  session: WeekendSession;
  now: Date;
  clickable: boolean;
  onSelect: () => void;
}) {
  const showCountdown = session.status === "upcoming" && session.start;
  const content = (
    <>
      <div className="flex items-center gap-3">
        <StatusDot status={session.status} />
        <span className={session.status === "done" ? "text-f1-text-muted" : "font-medium"}>
          {session.label}
        </span>
        {session.status === "live" && (
          <span className="rounded-full bg-f1-red px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            Live
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 text-right text-f1-text-muted">
        {showCountdown ? (
          <span className="font-mono tabular-nums">in {formatCountdown(session.start!, now)}</span>
        ) : (
          <span>{formatSessionTime(session.start)}</span>
        )}
        {clickable && (
          <span className="inline-flex items-center gap-0.5 text-xs text-f1-red">
            Results
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        )}
      </div>
    </>
  );

  if (clickable) {
    return (
      <li>
        <button
          type="button"
          onClick={onSelect}
          className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-f1-surface-hover focus:outline-none focus-visible:ring-1 focus-visible:ring-f1-red"
        >
          {content}
        </button>
      </li>
    );
  }

  return (
    <li
      className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm ${
        session.status === "live" ? "bg-f1-red/10" : ""
      }`}
    >
      {content}
    </li>
  );
}

function SessionTimeline({
  sessions,
  now,
  resultKeys,
  onSelect,
}: {
  sessions: WeekendSession[];
  now: Date;
  resultKeys: Set<string>;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="rounded-xl border border-f1-border bg-f1-surface p-5">
      <h2 className="mb-4 font-bold">Weekend Schedule</h2>
      <ul className="space-y-1">
        {sessions.map((s) => (
          <SessionRow
            key={s.key}
            session={s}
            now={now}
            clickable={resultKeys.has(s.key)}
            onSelect={() => onSelect(s.key)}
          />
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-f1-text-muted">
        Times shown in your local timezone. Live windows are estimated from start times. Click a
        session with published results to open them; practice timing isn't provided by the API.
      </p>
    </div>
  );
}

function position(r: { positionText: string; position: string }) {
  if (r.positionText === "R") return <span className="text-f1-red">RET</span>;
  if (r.positionText === "D") return <span className="text-f1-red">DSQ</span>;
  if (/^\d+$/.test(r.positionText)) return r.position;
  return <span className="text-f1-text-muted">{r.positionText}</span>;
}

function ResultsTable({ results, points }: { results: RaceResult[]; points: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-f1-border text-left text-f1-text-muted">
            <th className="px-3 py-2 w-12">Pos</th>
            <th className="px-3 py-2">Driver</th>
            <th className="px-3 py-2 hidden sm:table-cell">Team</th>
            <th className="px-3 py-2 text-right hidden sm:table-cell">Grid</th>
            <th className="px-3 py-2 text-right hidden md:table-cell">Laps</th>
            <th className="px-3 py-2 text-right">Time</th>
            {points && <th className="px-3 py-2 text-right">Pts</th>}
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr
              key={r.position + r.Driver.driverId}
              className="border-b border-f1-border/50 hover:bg-f1-surface-hover transition-colors"
            >
              <td className="px-3 py-2 font-mono">{position(r)}</td>
              <td className="px-3 py-2">
                <Link
                  to={`/driver/${r.Driver.driverId}`}
                  className="hover:text-f1-red transition-colors"
                >
                  {r.Driver.givenName} {r.Driver.familyName}
                </Link>
                {r.FastestLap?.rank === "1" && (
                  <span
                    className="ml-2 rounded bg-purple-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-purple-400"
                    title={`Fastest lap: ${r.FastestLap.Time?.time ?? ""}`}
                  >
                    FL
                  </span>
                )}
              </td>
              <td className="px-3 py-2 text-f1-text-muted hidden sm:table-cell">
                {r.Constructor.name}
              </td>
              <td className="px-3 py-2 text-right text-f1-text-muted hidden sm:table-cell">
                {r.grid}
              </td>
              <td className="px-3 py-2 text-right text-f1-text-muted hidden md:table-cell">
                {r.laps}
              </td>
              <td className="px-3 py-2 text-right font-mono text-f1-text-muted">
                {r.Time?.time ?? r.status}
              </td>
              {points && (
                <td className="px-3 py-2 text-right font-semibold">
                  {r.points !== "0" ? r.points : ""}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QualifyingTable({ results }: { results: QualifyingResult[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-f1-border text-left text-f1-text-muted">
            <th className="px-3 py-2 w-12">Pos</th>
            <th className="px-3 py-2">Driver</th>
            <th className="px-3 py-2 hidden sm:table-cell">Team</th>
            <th className="px-3 py-2 text-right font-mono">Q1</th>
            <th className="px-3 py-2 text-right font-mono hidden sm:table-cell">Q2</th>
            <th className="px-3 py-2 text-right font-mono">Q3</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr
              key={r.position + r.Driver.driverId}
              className="border-b border-f1-border/50 hover:bg-f1-surface-hover transition-colors"
            >
              <td className="px-3 py-2 font-mono">{r.position}</td>
              <td className="px-3 py-2">
                <Link
                  to={`/driver/${r.Driver.driverId}`}
                  className="hover:text-f1-red transition-colors"
                >
                  {r.Driver.givenName} {r.Driver.familyName}
                </Link>
              </td>
              <td className="px-3 py-2 text-f1-text-muted hidden sm:table-cell">
                {r.Constructor.name}
              </td>
              <td className="px-3 py-2 text-right font-mono text-f1-text-muted">{r.Q1 ?? "-"}</td>
              <td className="px-3 py-2 text-right font-mono text-f1-text-muted hidden sm:table-cell">
                {r.Q2 ?? "-"}
              </td>
              <td className="px-3 py-2 text-right font-mono">{r.Q3 ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PitStopsTable({ stops }: { stops: PitStop[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-f1-border text-left text-f1-text-muted">
            <th className="px-3 py-2">Driver</th>
            <th className="px-3 py-2 text-right">Stop</th>
            <th className="px-3 py-2 text-right">Lap</th>
            <th className="px-3 py-2 text-right">Duration</th>
          </tr>
        </thead>
        <tbody>
          {stops.map((s) => (
            <tr
              key={s.driverId + s.stop}
              className="border-b border-f1-border/50 hover:bg-f1-surface-hover transition-colors"
            >
              <td className="px-3 py-2">
                <Link to={`/driver/${s.driverId}`} className="hover:text-f1-red transition-colors">
                  {s.driverId}
                </Link>
              </td>
              <td className="px-3 py-2 text-right text-f1-text-muted">{s.stop}</td>
              <td className="px-3 py-2 text-right text-f1-text-muted">{s.lap}</td>
              <td className="px-3 py-2 text-right font-mono">{s.duration}s</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type TabKey = "schedule" | "race" | "qualifying" | "sprint" | "pitstops";

export default function Race() {
  const { year, round } = useParams<{ year: string; round: string }>();
  const now = useClock(1000);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: race, loading: rl, error: rerr } = useFetch<RaceType | null>(
    () => getRace(year!, round!),
    [year, round, refreshKey]
  );
  const { data: results } = useFetch<RaceWithResults | null>(
    () => getRaceResults(year!, round!),
    [year, round, refreshKey]
  );
  const { data: qualifying } = useFetch<QualifyingResult[]>(
    () => getQualifyingResults(year!, round!),
    [year, round, refreshKey]
  );
  const { data: sprint } = useFetch<RaceResult[]>(
    () => getSprintResults(year!, round!),
    [year, round, refreshKey]
  );
  const { data: pitstops } = useFetch<PitStop[]>(
    () => getPitStops(year!, round!),
    [year, round, refreshKey]
  );

  usePageTitle(race ? `${race.raceName} · ${year}` : "Race Weekend");

  const sessions = useMemo(() => (race ? getRaceSessions(race, now) : []), [race, now]);
  const weekend = useMemo(() => (race ? getWeekendInfo(race, now) : null), [race, now]);

  const hasRace = !!results?.Results?.length;
  const hasQuali = !!qualifying?.length;
  const hasSprint = !!sprint?.length;
  const hasPits = !!pitstops?.length;

  // Schedule rows that map to a results view the API actually publishes.
  const resultKeys = useMemo(() => {
    const keys = new Set<string>();
    if (hasRace) keys.add("race");
    if (hasQuali) keys.add("qualifying");
    if (hasSprint) keys.add("sprint");
    return keys;
  }, [hasRace, hasQuali, hasSprint]);

  // Auto-refresh data while the weekend is in progress.
  useEffect(() => {
    if (!weekend?.weekendActive || !year || !round) return;
    const id = setInterval(() => {
      invalidateCache(`/${year}/${round}`);
      setRefreshKey((k) => k + 1);
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [weekend?.weekendActive, year, round]);

  const [tab, setTab] = useState<TabKey>("schedule");
  const [tabTouched, setTabTouched] = useState(false);

  // Pick the most relevant default tab once data lands (unless the user chose).
  useEffect(() => {
    if (tabTouched) return;
    if (hasRace) setTab("race");
    else if (hasQuali) setTab("qualifying");
    else if (hasSprint) setTab("sprint");
    else setTab("schedule");
  }, [hasRace, hasQuali, hasSprint, tabTouched]);

  const tabs: { key: TabKey; label: string; show: boolean }[] = [
    { key: "schedule", label: "Schedule", show: true },
    { key: "race", label: "Race", show: hasRace },
    { key: "qualifying", label: "Qualifying", show: hasQuali },
    { key: "sprint", label: "Sprint", show: hasSprint },
    { key: "pitstops", label: "Pit Stops", show: hasPits },
  ];

  return (
    <div>
      <div className="mb-1">
        <Link
          to={`/season/${year}`}
          className="text-sm text-f1-text-muted hover:text-f1-red transition-colors"
        >
          &larr; {year} Season
        </Link>
      </div>

      {rerr && <ErrorMessage message={rerr} />}
      {rl && !race && <Loader />}

      {race && (
        <>
          <div className="mb-6 mt-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">{race.raceName}</h1>
              {weekend?.isLive && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-f1-red px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                  {weekend.liveSession?.shortLabel} Live
                </span>
              )}
            </div>
            <p className="mt-1 text-f1-text-muted">
              {race.Circuit.circuitName} &middot; {race.Circuit.Location.locality},{" "}
              {race.Circuit.Location.country}
            </p>
            {weekend && !weekend.isLive && weekend.nextSession?.start && (
              <p className="mt-3 inline-flex items-center gap-2 rounded-lg border border-f1-border bg-f1-surface px-3 py-2 text-sm">
                <span className="text-f1-text-muted">Next: {weekend.nextSession.label} in</span>
                <span className="font-mono font-semibold tabular-nums text-f1-red">
                  {formatCountdown(weekend.nextSession.start, now)}
                </span>
              </p>
            )}
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {tabs.filter((t) => t.show).map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key);
                  setTabTouched(true);
                }}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  tab === t.key
                    ? "border-f1-red bg-f1-red/10 text-f1-red"
                    : "border-f1-border text-f1-text-muted hover:text-f1-text"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "schedule" && (
            <SessionTimeline
              sessions={sessions}
              now={now}
              resultKeys={resultKeys}
              onSelect={(key) => {
                if (key === "race" || key === "qualifying" || key === "sprint") {
                  setTab(key);
                  setTabTouched(true);
                }
              }}
            />
          )}
          {tab === "race" && results && <ResultsTable results={results.Results} points />}
          {tab === "qualifying" && qualifying && <QualifyingTable results={qualifying} />}
          {tab === "sprint" && sprint && <ResultsTable results={sprint} points />}
          {tab === "pitstops" && pitstops && <PitStopsTable stops={pitstops} />}

          {tab !== "schedule" && !hasRace && !hasQuali && !hasSprint && (
            <p className="text-f1-text-muted">No timing data published yet for this weekend.</p>
          )}
        </>
      )}
    </div>
  );
}
