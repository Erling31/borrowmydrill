"use client";

import { useState } from "react";

const MONTHS = [
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
];
const WEEKDAYS = ["M", "T", "O", "T", "F", "L", "S"];

function fmt(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function MiniCalendar({
  startDate,
  endDate,
  onChange,
}: {
  startDate: string;
  endDate: string;
  onChange: (range: { startDate: string; endDate: string }) => void;
}) {
  const today = startOfDay(new Date());
  const [viewDate, setViewDate] = useState(() => {
    const base = startDate ? new Date(startDate) : today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const start = startDate ? startOfDay(new Date(startDate)) : null;
  const end = endDate ? startOfDay(new Date(endDate)) : null;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  // Monday-first offset
  const offset = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  function pickDay(day: Date) {
    const d = startOfDay(day);
    if (!start || (start && end)) {
      onChange({ startDate: fmt(d), endDate: "" });
    } else if (d < start) {
      onChange({ startDate: fmt(d), endDate: "" });
    } else {
      onChange({ startDate: fmt(start), endDate: fmt(d) });
    }
  }

  return (
    <div className="border border-warm-200 rounded-xl bg-warm-50 p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:bg-warm-100 transition-colors"
          aria-label="Forrige måned"
        >
          ‹
        </button>
        <span className="text-sm font-semibold text-[#1e1f21] capitalize">
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:bg-warm-100 transition-colors"
          aria-label="Neste måned"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="text-center text-[11px] font-semibold text-zinc-400 py-1">{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isPast = d < today;
          const isStart = start && fmt(d) === fmt(start);
          const isEnd = end && fmt(d) === fmt(end);
          const inRange = start && end && d > start && d < end;
          return (
            <button
              key={i}
              type="button"
              disabled={isPast}
              onClick={() => pickDay(d)}
              className={`h-9 rounded-lg text-sm font-medium transition-colors ${
                isPast
                  ? "text-zinc-300 cursor-not-allowed"
                  : isStart || isEnd
                  ? "bg-coral-500 text-white"
                  : inRange
                  ? "bg-coral-100 text-coral-700"
                  : "text-zinc-600 hover:bg-warm-100"
              }`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-zinc-500 mt-3">
        {start && end
          ? `${start.toLocaleDateString("nb", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("nb", { day: "numeric", month: "short" })}`
          : start
          ? "Velg sluttdato"
          : "Velg startdato"}
      </p>
    </div>
  );
}
