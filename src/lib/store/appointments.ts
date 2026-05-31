import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { format } from "date-fns";

export type AppointmentStatus = "confirmed" | "checked_in" | "completed" | "cancelled";

export interface StoredAppointment {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  barber_id: string;
  barber_name: string;
  service_id: string;
  service_name: string;
  service_duration: number;
  service_price: number;
  starts_at: string;
  ends_at: string;
  notes: string | null;
  status: AppointmentStatus;
  checked_in_at: string | null;
  created_at: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const APPOINTMENTS_FILE = path.join(DATA_DIR, "appointments.json");

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(APPOINTMENTS_FILE);
  } catch {
    await fs.writeFile(APPOINTMENTS_FILE, "[]", "utf-8");
  }
}

export async function readAppointments(): Promise<StoredAppointment[]> {
  await ensureStore();
  const raw = await fs.readFile(APPOINTMENTS_FILE, "utf-8");
  return JSON.parse(raw) as StoredAppointment[];
}

async function writeAppointments(appointments: StoredAppointment[]) {
  await ensureStore();
  await fs.writeFile(APPOINTMENTS_FILE, JSON.stringify(appointments, null, 2), "utf-8");
}

export async function createAppointment(
  data: Omit<StoredAppointment, "id" | "created_at" | "checked_in_at" | "status"> & {
    status?: AppointmentStatus;
  }
): Promise<StoredAppointment> {
  const appointments = await readAppointments();
  const appointment: StoredAppointment = {
    ...data,
    id: randomUUID(),
    status: data.status ?? "confirmed",
    checked_in_at: null,
    created_at: new Date().toISOString(),
  };
  appointments.push(appointment);
  await writeAppointments(appointments);
  return appointment;
}

export async function updateAppointmentById(
  id: string,
  updates: Partial<
    Pick<
      StoredAppointment,
      | "status"
      | "checked_in_at"
      | "starts_at"
      | "ends_at"
      | "barber_id"
      | "barber_name"
      | "service_id"
      | "service_name"
      | "service_duration"
      | "service_price"
      | "notes"
    >
  >
): Promise<StoredAppointment | null> {
  const appointments = await readAppointments();
  const index = appointments.findIndex((a) => a.id === id);
  if (index === -1) return null;

  appointments[index] = { ...appointments[index], ...updates };
  await writeAppointments(appointments);
  return appointments[index];
}

export async function findAppointmentsByIds(ids: string[]) {
  const set = new Set(ids);
  const appointments = await readAppointments();
  return appointments.filter((a) => set.has(a.id));
}

export async function findAppointmentById(id: string) {
  const appointments = await readAppointments();
  return appointments.find((a) => a.id === id) ?? null;
}

export async function searchAppointments(query: string) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const appointments = await readAppointments();
  return appointments.filter((a) => {
    const dateStr = format(new Date(a.starts_at), "yyyy-MM-dd HH:mm EEEE");
    const haystack = [
      a.customer_name,
      a.customer_phone,
      a.customer_email ?? "",
      a.service_name,
      a.barber_name,
      a.id,
      a.status,
      dateStr,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
