import { useMemo, useState } from "react";
import type { IconType } from "react-icons";
import {
  PiCaretLeft,
  PiCaretRight,
  PiPiggyBank,
  PiGauge,
  PiFlagBanner,
} from "react-icons/pi";
import jcLogo from "./assets/jc-logo-horizontal.png";
import { buildMonthGrid, toISODate } from "./lib/calendarGrid";

/** Fixed "today" anchor for this mockup's placeholder data (real date: 2026-09-24). */
const TODAY_ISO = "2026-09-24";

const ACCENT = "#cd553f";

interface MarketingEvent {
  id: number;
  title: string;
  /** ISO date (YYYY-MM-DD) */
  date: string;
  notes?: string;
}

interface PersonGoal {
  person: "Jeffrey" | "Kaden" | "Ben";
  icon: IconType;
  goal: string;
  detail: string;
}

const TEAM_GOAL = {
  title: "Winter Prep: Build the Spring Launch Toolkit",
  deadlineISO: "2026-10-31",
};

/** Kaden's month-by-month focus, October through April. */
const KADEN_ROADMAP: { month: string; task: string }[] = [
  { month: "October", task: "CEO Viewer" },
  { month: "November", task: "Aranza Trained" },
  { month: "December", task: "Aranza Dashboard" },
  { month: "January", task: "Custom Quoter Updates (Estimator)" },
  { month: "February", task: "Cultivator Turned Back On" },
  { month: "March", task: "Reactivator Started (Collecting Names for May)" },
  { month: "April", task: "Reviews & Referrals" },
];

const PERSON_GOALS: PersonGoal[] = [
  {
    person: "Jeffrey",
    icon: PiPiggyBank,
    goal: "Pool Cash for Spring",
    detail: "$10,000 minimum in a side savings account",
  },
  {
    person: "Kaden",
    icon: PiGauge,
    goal: "CEO Dashboard (Simplified)",
    detail: "Build the simplified version of the dashboard",
  },
  {
    person: "Ben",
    icon: PiFlagBanner,
    goal: "Door Hangers",
    detail: "Create door hangers for the neighborhoods we're working in",
  },
];

const initialMarketingEvents: MarketingEvent[] = [
  {
    id: 1,
    title: "Door hanger design draft due",
    date: "2026-10-03",
    notes: "Ben to review with Jeffrey before sending to print",
  },
  {
    id: 2,
    title: "Printer proof pickup",
    date: "2026-10-10",
    notes: "Door hangers, trifolds, A-frame props",
  },
  {
    id: 3,
    title: "Neighborhood canvass kickoff",
    date: "2026-10-15",
    notes: "First door hanger drop in priority service areas",
  },
  {
    id: 4,
    title: "Spring savings check-in",
    date: "2026-10-20",
    notes: "Confirm progress toward the $10,000 minimum",
  },
  {
    id: 5,
    title: "CEO Dashboard (Simplified) demo",
    date: "2026-10-28",
    notes: "Kaden walks the team through the simplified dashboard",
  },
];

const CALENDAR_WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function formatShortDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** Kaden's focus for the upcoming calendar month (real current date, not the mock TODAY_ISO anchor). */
function upcomingKadenTask(now: Date = new Date()) {
  const upcomingMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleDateString(
    undefined,
    { month: "long" },
  );
  return KADEN_ROADMAP.find((r) => r.month === upcomingMonth) ?? null;
}

function SectionLabel({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <h2
      className={`text-xs font-semibold uppercase tracking-wide ${
        accent ? "text-white/80" : "text-neutral-400"
      }`}
    >
      {children}
    </h2>
  );
}

function IconBadge({ icon: Icon, size = 20, box = 36 }: { icon: IconType; size?: number; box?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{ width: box, height: box, backgroundColor: `${ACCENT}1a`, color: ACCENT }}
    >
      <Icon size={size} />
    </span>
  );
}

function Section({
  title,
  accent = false,
  children,
}: {
  title: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl p-6 shadow-sm ${accent ? "" : "bg-white ring-1 ring-neutral-100"}`}
      style={{
        backgroundColor: accent ? ACCENT : undefined,
        boxShadow: accent ? `0 8px 20px ${ACCENT}40` : undefined,
      }}
    >
      <SectionLabel accent={accent}>{title}</SectionLabel>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function EventCalendar({ events }: { events: MarketingEvent[] }) {
  const [cursor, setCursor] = useState(() => {
    const [y, m] = TEAM_GOAL.deadlineISO.split("-").map(Number);
    return new Date(y, m - 1, 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, MarketingEvent[]> = {};
    for (const event of events) {
      (map[event.date] ??= []).push(event);
    }
    return map;
  }, [events]);

  function changeMonth(delta: number) {
    setCursor(new Date(year, month + delta, 1));
  }

  const selectedEvents = selectedDate ? eventsByDate[selectedDate] ?? [] : [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          onClick={() => changeMonth(-1)}
          aria-label="Previous month"
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-50"
        >
          <PiCaretLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-neutral-900">
          {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </span>
        <button
          onClick={() => changeMonth(1)}
          aria-label="Next month"
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-50"
        >
          <PiCaretRight size={18} />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-y-1 text-center text-[10px] font-medium text-neutral-400">
        {CALENDAR_WEEKDAYS.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {grid.map((d, i) => {
          if (d === null) return <div key={i} />;
          const iso = toISODate(year, month, d);
          const dayEvents = eventsByDate[iso] ?? [];
          const isToday = iso === TODAY_ISO;
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(iso)}
              className="flex flex-col items-center gap-0.5 rounded-lg py-1.5 hover:bg-neutral-50"
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                  isToday ? "text-white" : "text-neutral-700"
                }`}
                style={isToday ? { backgroundColor: ACCENT } : undefined}
              >
                {d}
              </span>
              <span className="flex h-1.5 items-center gap-0.5">
                {dayEvents.length > 0 && (
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-neutral-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ACCENT }} />
          Has plans
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-neutral-200" />
          Free day
        </span>
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-400">Upcoming</p>
      <div className="mt-2 flex flex-col gap-2">
        {[...events]
          .sort((a, b) => (a.date < b.date ? -1 : 1))
          .slice(0, 4)
          .map((event) => (
            <button
              key={event.id}
              onClick={() => setSelectedDate(event.date)}
              className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-3 text-left"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: ACCENT }} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-900">
                {event.title}
              </span>
              <span className="shrink-0 text-xs text-neutral-400">{formatShortDate(event.date)}</span>
            </button>
          ))}
      </div>

      {selectedDate && (
        <div
          className="fixed inset-0 z-20 flex items-end justify-center bg-black/30 sm:items-center"
          onClick={() => setSelectedDate(null)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl bg-white p-6 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-neutral-900">
                {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-sm font-medium text-neutral-400"
              >
                Close
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {selectedEvents.length === 0 && (
                <p className="text-sm text-neutral-400">Nothing planned, free day.</p>
              )}
              {selectedEvents.map((event) => (
                <div key={event.id} className="rounded-xl border border-neutral-100 bg-neutral-50/60 p-3">
                  <p className="text-sm font-medium text-neutral-900">{event.title}</p>
                  {event.notes && <p className="mt-1 text-xs text-neutral-500">{event.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const kadenNext = upcomingKadenTask();

  return (
    <div className="min-h-screen bg-[#faf9f7] pb-10">
      <header className="flex items-center justify-between border-b border-neutral-100 bg-white px-5 py-4">
        <div>
          <img src={jcLogo} alt="J&amp;C Asphalt" className="h-8 w-auto" />
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-neutral-400">
            Winter Planner
          </p>
        </div>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pt-6">
        <Section title="October Goal" accent>
          <p className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            {TEAM_GOAL.title}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm text-white/70">
              {new Date(`${TEAM_GOAL.deadlineISO}T00:00:00`).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {kadenNext && (
              <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-xs font-semibold text-white">
                Kaden's up next: {kadenNext.task}
              </span>
            )}
          </div>
        </Section>

        <Section title="Individual Goals">
          <div className="flex flex-col gap-3">
            {PERSON_GOALS.map((pg) => (
              <div key={pg.person} className="rounded-xl border border-neutral-100 bg-white p-4">
                <div className="flex items-start gap-3">
                  <IconBadge icon={pg.icon} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                      {pg.person}
                    </p>
                    <p className="font-semibold text-neutral-900">{pg.goal}</p>
                    <p className="mt-0.5 text-sm text-neutral-500">{pg.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Marketing Calendar">
          <EventCalendar events={initialMarketingEvents} />
        </Section>
      </main>
    </div>
  );
}
