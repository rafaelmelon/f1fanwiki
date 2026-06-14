import type { Race, Session } from "./types";

export type SessionStatus = "upcoming" | "live" | "done";

export interface WeekendSession {
  key: string;
  label: string;
  shortLabel: string;
  start: Date | null;
  /** Estimated end — the schedule only exposes start times. */
  end: Date | null;
  status: SessionStatus;
}

/** Estimated session durations in minutes (broadcast windows, not flag-to-flag). */
const DURATIONS: Record<string, number> = {
  fp1: 60,
  fp2: 60,
  fp3: 60,
  sprintQualifying: 45,
  sprint: 60,
  qualifying: 60,
  race: 120,
};

interface SessionDef {
  key: keyof typeof DURATIONS;
  label: string;
  shortLabel: string;
  session: Session | undefined;
}

export function sessionStart(session: Session | undefined): Date | null {
  if (!session) return null;
  // Ergast omits time for some historic sessions; fall back to midnight UTC.
  return new Date(`${session.date}T${session.time ?? "00:00:00Z"}`);
}

function statusFor(start: Date | null, end: Date | null, now: Date): SessionStatus {
  if (!start) return "upcoming";
  if (end && now.getTime() > end.getTime()) return "done";
  if (now.getTime() >= start.getTime()) return "live";
  return "upcoming";
}

/**
 * Build the ordered list of sessions for a race weekend, each tagged with a
 * status (upcoming / live / done) relative to `now`. Sprint weekends and
 * conventional weekends are both handled — only sessions present in the
 * schedule are returned, sorted chronologically.
 */
export function getRaceSessions(race: Race, now: Date = new Date()): WeekendSession[] {
  const defs: SessionDef[] = [
    { key: "fp1", label: "Practice 1", shortLabel: "FP1", session: race.FirstPractice },
    { key: "fp2", label: "Practice 2", shortLabel: "FP2", session: race.SecondPractice },
    { key: "fp3", label: "Practice 3", shortLabel: "FP3", session: race.ThirdPractice },
    { key: "sprintQualifying", label: "Sprint Qualifying", shortLabel: "SQ", session: race.SprintQualifying },
    { key: "sprint", label: "Sprint", shortLabel: "SPR", session: race.Sprint },
    { key: "qualifying", label: "Qualifying", shortLabel: "Quali", session: race.Qualifying },
    { key: "race", label: "Race", shortLabel: "Race", session: { date: race.date, time: race.time } },
  ];

  return defs
    .filter((d) => d.session && d.session.date)
    .map((d) => {
      const start = sessionStart(d.session);
      const end =
        start && d.session?.time
          ? new Date(start.getTime() + DURATIONS[d.key] * 60_000)
          : null;
      return {
        key: d.key,
        label: d.label,
        shortLabel: d.shortLabel,
        start,
        end,
        status: statusFor(start, end, now),
      };
    })
    .sort((a, b) => (a.start?.getTime() ?? 0) - (b.start?.getTime() ?? 0));
}

export interface WeekendInfo {
  /** A session is currently in progress (within its estimated window). */
  isLive: boolean;
  /** The whole weekend (first session → race end) is in progress. */
  weekendActive: boolean;
  /** The session happening right now, if any. */
  liveSession: WeekendSession | null;
  /** The next session that has not started yet, if any. */
  nextSession: WeekendSession | null;
}

export function getWeekendInfo(race: Race, now: Date = new Date()): WeekendInfo {
  const sessions = getRaceSessions(race, now);
  const liveSession = sessions.find((s) => s.status === "live") ?? null;
  const nextSession = sessions.find((s) => s.status === "upcoming") ?? null;

  const first = sessions[0]?.start ?? null;
  const last = sessions[sessions.length - 1];
  const weekendEnd = last?.end ?? last?.start ?? null;
  const weekendActive =
    !!first &&
    now.getTime() >= first.getTime() &&
    (!weekendEnd || now.getTime() <= weekendEnd.getTime());

  return {
    isLive: !!liveSession,
    weekendActive,
    liveSession,
    nextSession,
  };
}

export interface ResolvedRace {
  race: Race;
  /** Weekend currently in progress (a session is happening or about to). */
  isCurrent: boolean;
  /** Season is over — this is the most recent race. */
  isPast: boolean;
}

/**
 * Pick the race to feature as "current": the weekend in progress, otherwise
 * the next upcoming race, otherwise (season finished) the most recent one.
 */
export function resolveCurrentRace(
  races: Race[],
  now: Date = new Date()
): ResolvedRace | null {
  if (races.length === 0) return null;

  const sorted = [...races].sort((a, b) => +a.round - +b.round);

  const active = sorted.find((r) => getWeekendInfo(r, now).weekendActive);
  if (active) return { race: active, isCurrent: true, isPast: false };

  const upcoming = sorted.find((r) => {
    const start = sessionStart({ date: r.date, time: r.time });
    return start && start.getTime() > now.getTime();
  });
  if (upcoming) return { race: upcoming, isCurrent: false, isPast: false };

  return { race: sorted[sorted.length - 1], isCurrent: false, isPast: true };
}
