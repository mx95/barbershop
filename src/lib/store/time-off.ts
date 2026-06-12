import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export interface TimeOffBlock {
  id: string;
  barber_id: string;
  date: string;
  all_day: boolean;
  start: string | null;
  end: string | null;
  note: string | null;
  created_at: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "time-off.json");

async function ensureFile() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(FILE, "utf-8");
  } catch {
    await writeFile(FILE, "[]", "utf-8");
  }
}

export async function readTimeOff(): Promise<TimeOffBlock[]> {
  await ensureFile();
  const raw = await readFile(FILE, "utf-8");
  return JSON.parse(raw) as TimeOffBlock[];
}

export async function createTimeOff(
  input: Omit<TimeOffBlock, "id" | "created_at">
): Promise<TimeOffBlock> {
  const blocks = await readTimeOff();
  const block: TimeOffBlock = {
    ...input,
    id: randomUUID(),
    created_at: new Date().toISOString(),
  };
  blocks.push(block);
  await writeFile(FILE, JSON.stringify(blocks, null, 2), "utf-8");
  return block;
}

export async function deleteTimeOff(id: string): Promise<boolean> {
  const blocks = await readTimeOff();
  const next = blocks.filter((b) => b.id !== id);
  if (next.length === blocks.length) return false;
  await writeFile(FILE, JSON.stringify(next, null, 2), "utf-8");
  return true;
}

export function timeOffBlocksForBarberDay(
  blocks: readonly TimeOffBlock[],
  barberId: string,
  dateKey: string
): TimeOffBlock[] {
  return blocks.filter((b) => b.barber_id === barberId && b.date === dateKey);
}
