export function startOfLocalDay(date = new Date(), timeZone = "UTC") {
  return zonedDayRangeUtc(date, timeZone).start;
}

export function endOfLocalDay(date = new Date(), timeZone = "UTC") {
  return zonedDayRangeUtc(date, timeZone).end;
}

export function isInsideActiveWindow(now: Date, startTime: string, endTime: string, timeZone = "UTC") {
  const parts = getZonedParts(now, timeZone);
  const current = minutesFromMidnight(`${parts.hour}:${parts.minute}`);
  const start = minutesFromMidnight(startTime);
  const end = minutesFromMidnight(endTime);

  if (start <= end) return current >= start && current <= end;
  return current >= start || current <= end;
}

export function localDateKey(date: Date, timeZone = "UTC") {
  const parts = getZonedParts(date, timeZone);
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
}

export function zonedDayRangeUtc(date: Date, timeZone = "UTC") {
  const parts = getZonedParts(date, timeZone);
  const start = zonedTimeToUtc(parts.year, parts.month, parts.day, 0, 0, 0, 0, timeZone);
  const nextStart = zonedTimeToUtc(parts.year, parts.month, parts.day + 1, 0, 0, 0, 0, timeZone);
  return { start, end: new Date(nextStart.getTime() - 1) };
}

function zonedTimeToUtc(year: number, month: number, day: number, hour: number, minute: number, second: number, ms: number, timeZone: string) {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, second, ms));
  const offsetMinutes = getTimeZoneOffsetMinutes(utcGuess, timeZone);
  return new Date(utcGuess.getTime() - offsetMinutes * 60_000);
}

function getTimeZoneOffsetMinutes(date: Date, timeZone: string) {
  const parts = getZonedParts(date, timeZone);
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return Math.round((asUtc - date.getTime()) / 60_000);
}

function getZonedParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
  const values = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  const hour = Number(values.hour === "24" ? "0" : values.hour);

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour,
    minute: Number(values.minute),
    second: Number(values.second)
  };
}

function minutesFromMidnight(time: string) {
  const [hour = "0", minute = "0"] = time.split(":");
  return Number(hour) * 60 + Number(minute);
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}
