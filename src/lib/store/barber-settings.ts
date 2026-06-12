import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { BARBERS } from "@/lib/constants";

export type BarberSettings = {
  calendar_email: string;
};

type SettingsFile = Record<string, BarberSettings>;

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "barber-settings.json");

function defaultEmailForBarber(barberId: string): string {
  const envKey = `${barberId.toUpperCase()}_CALENDAR_EMAIL`;
  return process.env[envKey]?.trim() ?? "";
}

async function ensureFile() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(FILE, "utf-8");
  } catch {
    const seed: SettingsFile = {};
    for (const barber of BARBERS) {
      seed[barber.id] = { calendar_email: defaultEmailForBarber(barber.id) };
    }
    await writeFile(FILE, JSON.stringify(seed, null, 2), "utf-8");
  }
}

export async function readBarberSettings(): Promise<SettingsFile> {
  await ensureFile();
  const raw = await readFile(FILE, "utf-8");
  return JSON.parse(raw) as SettingsFile;
}

export async function getBarberCalendarEmail(barberId: string): Promise<string> {
  const all = await readBarberSettings();
  return all[barberId]?.calendar_email?.trim() ?? defaultEmailForBarber(barberId);
}

export async function updateBarberCalendarEmail(
  barberId: string,
  calendarEmail: string
): Promise<BarberSettings> {
  const all = await readBarberSettings();
  const next: BarberSettings = { calendar_email: calendarEmail.trim() };
  all[barberId] = next;
  await writeFile(FILE, JSON.stringify(all, null, 2), "utf-8");
  return next;
}
