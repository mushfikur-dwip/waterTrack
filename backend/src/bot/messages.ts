import type { getTodayProgress } from "../services/water.js";

type Progress = Awaited<ReturnType<typeof getTodayProgress>>;

export function progressText(progress: Progress) {
  return [
    "পানি খেয়েছেন?",
    `আজকের Target: ${progress.targetMl}ml`,
    `এখন পর্যন্ত: ${progress.consumedMl}ml`,
    `বাকি: ${progress.remainingMl}ml`
  ].join("\n");
}

export function setupText() {
  return [
    "স্বাগতম! আপনার water tracking চালু হয়েছে।",
    "Default target: 2500ml",
    "Reminder interval: 60 minutes",
    "Active time: 08:00 - 22:00",
    "",
    "পরিবর্তন করতে /settarget 3000, /setinterval 30 অথবা /settings ব্যবহার করুন।"
  ].join("\n");
}
