export function startOfLocalDay(date = new Date()) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

export function endOfLocalDay(date = new Date()) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

export function isInsideActiveWindow(now: Date, startTime: string, endTime: string) {
  const current = minutesFromMidnight(`${now.getHours()}:${now.getMinutes()}`);
  const start = minutesFromMidnight(startTime);
  const end = minutesFromMidnight(endTime);

  if (start <= end) return current >= start && current <= end;
  return current >= start || current <= end;
}

function minutesFromMidnight(time: string) {
  const [hour = "0", minute = "0"] = time.split(":");
  return Number(hour) * 60 + Number(minute);
}
