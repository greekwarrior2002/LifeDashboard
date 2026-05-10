import { promises as fs } from "node:fs";
import path from "node:path";
import {
  SERVICE_TYPE_LABELS,
  type GarageAlert,
  type GarageCar,
  type GarageCarInput,
  type GarageReminder,
  type GarageReminderInput,
  type GarageServiceInput,
  type GarageServiceRecord,
  type GarageServiceType,
  type GarageSnapshot,
  type GarageState,
} from "@/lib/types/garage";

function resolveDataDir(): string {
  const override = process.env.LIFEOS_DATA_DIR;
  if (override && override.length > 0) return override;
  if (process.env.VERCEL) return "/tmp/lifeos";
  return path.join(process.cwd(), "data");
}

const DATA_DIR = resolveDataDir();
const FILE_PATH = path.join(DATA_DIR, "garage.json");

const DEFAULT_INTERVALS = {
  oil_change: 8_000,
  air_filter: 24_000,
  cabin_filter: 20_000,
  timing_service: 100_000,
};

function nowIso(): string {
  return new Date().toISOString();
}

function id(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function seedGarage(): GarageState {
  const at = nowIso();
  const a5: GarageCar = {
    id: "audi-a5",
    make: "Audi",
    model: "A5 Quattro",
    year: 2012,
    nickname: "Daily",
    mileageKm: 168_420,
    maintenanceIntervalsKm: { ...DEFAULT_INTERVALS },
    notes: "Seeded default vehicle. Update mileage and records with real service history.",
    createdAt: at,
    updatedAt: at,
  };
  const tt: GarageCar = {
    id: "audi-tt",
    make: "Audi",
    model: "TT Roadster",
    year: 2001,
    nickname: "Weekend",
    mileageKm: 142_990,
    maintenanceIntervalsKm: { ...DEFAULT_INTERVALS },
    notes: "Seeded default vehicle. Add timing belt, tires, and seasonal notes as you confirm them.",
    createdAt: at,
    updatedAt: at,
  };
  return {
    cars: [a5, tt],
    services: [],
    reminders: [
      {
        id: "rem_a5_oil",
        carId: a5.id,
        type: "oil_change",
        label: "Oil change",
        intervalKm: DEFAULT_INTERVALS.oil_change,
        notes: "Default interval. Customize per car.",
        createdAt: at,
        updatedAt: at,
      },
      {
        id: "rem_tt_timing",
        carId: tt.id,
        type: "timing_service",
        label: "Timing service inspection",
        intervalKm: DEFAULT_INTERVALS.timing_service,
        notes: "Older TT reminder. Replace with actual belt/chain history once known.",
        createdAt: at,
        updatedAt: at,
      },
    ],
    updatedAt: at,
  };
}

async function ensureDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function mergeState(partial: Partial<GarageState> | null): GarageState {
  const seeded = seedGarage();
  if (!partial) return seeded;
  return {
    cars: Array.isArray(partial.cars) && partial.cars.length ? partial.cars : seeded.cars,
    services: Array.isArray(partial.services) ? partial.services : [],
    reminders: Array.isArray(partial.reminders) ? partial.reminders : seeded.reminders,
    updatedAt: partial.updatedAt ?? seeded.updatedAt,
  };
}

async function readRawGarage(): Promise<GarageState> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    return mergeState(JSON.parse(raw) as Partial<GarageState>);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return seedGarage();
    throw err;
  }
}

async function writeGarage(state: GarageState): Promise<void> {
  await ensureDir();
  const tmp = `${FILE_PATH}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(state, null, 2), "utf8");
  await fs.rename(tmp, FILE_PATH);
}

function assertMileageRollback(
  currentMileage: number,
  nextMileage: number,
  confirmed?: boolean,
): void {
  if (nextMileage < currentMileage && !confirmed) {
    throw new Error("mileage_rollback_requires_confirmation");
  }
}

function validateCar(input: GarageCarInput): void {
  if (!input.make.trim()) throw new Error("make_required");
  if (!input.model.trim()) throw new Error("model_required");
  if (!input.nickname.trim()) throw new Error("nickname_required");
  if (!Number.isFinite(input.year) || input.year < 1886) throw new Error("invalid_year");
  if (!Number.isFinite(input.mileageKm) || input.mileageKm < 0) throw new Error("invalid_mileage");
}

function validateService(input: GarageServiceInput, car: GarageCar): void {
  if (!input.carId) throw new Error("car_required");
  if (!input.date) throw new Error("date_required");
  if (!Number.isFinite(input.mileageKm) || input.mileageKm < 0) throw new Error("invalid_mileage");
  if (!Number.isFinite(input.cost) || input.cost < 0) throw new Error("invalid_cost");
  assertMileageRollback(car.mileageKm, Math.max(car.mileageKm, input.mileageKm), true);
}

function lastService(
  state: GarageState,
  carId: string,
  types: GarageServiceType[],
): GarageServiceRecord | undefined {
  return state.services
    .filter((service) => service.carId === carId && types.includes(service.type))
    .sort((a, b) => b.mileageKm - a.mileageKm || b.date.localeCompare(a.date))[0];
}

function intervalAlert(
  car: GarageCar,
  state: GarageState,
  type: GarageServiceType,
  label: string,
  intervalKm: number,
): GarageAlert {
  const service = lastService(state, car.id, [type]);
  if (!service) {
    return {
      carId: car.id,
      label,
      detail: "No service record yet",
      tone: "neutral",
    };
  }
  const kmSince = car.mileageKm - service.mileageKm;
  const kmRemaining = intervalKm - kmSince;
  if (kmRemaining < 0) {
    return {
      carId: car.id,
      label,
      detail: `Overdue by ${Math.abs(kmRemaining).toLocaleString()} km`,
      tone: "danger",
      kmRemaining,
    };
  }
  if (kmRemaining <= 1_000) {
    return {
      carId: car.id,
      label,
      detail: `Due in ${kmRemaining.toLocaleString()} km`,
      tone: "warn",
      kmRemaining,
    };
  }
  return {
    carId: car.id,
    label,
    detail: `Due in ${kmRemaining.toLocaleString()} km`,
    tone: "good",
    kmRemaining,
  };
}

function buildAlerts(state: GarageState): GarageAlert[] {
  const alerts: GarageAlert[] = [];
  for (const car of state.cars) {
    alerts.push(
      intervalAlert(
        car,
        state,
        "oil_change",
        `${car.nickname}: Oil change`,
        car.maintenanceIntervalsKm.oil_change,
      ),
      intervalAlert(
        car,
        state,
        "cabin_filter",
        `${car.nickname}: Cabin air filter`,
        car.maintenanceIntervalsKm.cabin_filter,
      ),
    );
    const brakes = lastService(state, car.id, ["brakes"]);
    if (brakes) {
      const kmSince = Math.max(0, car.mileageKm - brakes.mileageKm);
      alerts.push({
        carId: car.id,
        label: `${car.nickname}: Brakes`,
        detail: `Last brake service ${kmSince.toLocaleString()} km ago`,
        tone: kmSince > 40_000 ? "warn" : "neutral",
      });
    }
    for (const reminder of state.reminders.filter((r) => r.carId === car.id)) {
      if (!reminder.dueMileageKm && !reminder.dueDate) continue;
      const kmRemaining =
        typeof reminder.dueMileageKm === "number"
          ? reminder.dueMileageKm - car.mileageKm
          : undefined;
      const dueSoon =
        typeof kmRemaining === "number" ? kmRemaining <= 1_000 : false;
      const overdue =
        typeof kmRemaining === "number"
          ? kmRemaining < 0
          : reminder.dueDate
            ? new Date(reminder.dueDate).getTime() < Date.now()
            : false;
      alerts.push({
        carId: car.id,
        label: `${car.nickname}: ${reminder.label}`,
        detail:
          typeof kmRemaining === "number"
            ? overdue
              ? `Overdue by ${Math.abs(kmRemaining).toLocaleString()} km`
              : `Due in ${kmRemaining.toLocaleString()} km`
            : `Due ${reminder.dueDate}`,
        tone: overdue ? "danger" : dueSoon ? "warn" : "neutral",
        kmRemaining,
      });
    }
  }
  return alerts.sort((a, b) => {
    const rank = { danger: 0, warn: 1, neutral: 2, good: 3 };
    return rank[a.tone] - rank[b.tone];
  });
}

export async function getGarage(): Promise<GarageSnapshot> {
  const state = await readRawGarage();
  return { ...state, alerts: buildAlerts(state) };
}

export async function addCar(input: GarageCarInput): Promise<GarageSnapshot> {
  validateCar(input);
  const state = await readRawGarage();
  const at = nowIso();
  const car: GarageCar = {
    id: id("car"),
    make: input.make.trim(),
    model: input.model.trim(),
    year: input.year,
    nickname: input.nickname.trim(),
    mileageKm: input.mileageKm,
    vin: input.vin?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    maintenanceIntervalsKm: {
      ...DEFAULT_INTERVALS,
      ...(input.maintenanceIntervalsKm ?? {}),
    },
    createdAt: at,
    updatedAt: at,
  };
  const next = { ...state, cars: [...state.cars, car], updatedAt: at };
  await writeGarage(next);
  return { ...next, alerts: buildAlerts(next) };
}

export async function updateCar(
  carId: string,
  input: GarageCarInput,
): Promise<GarageSnapshot> {
  validateCar(input);
  const state = await readRawGarage();
  const current = state.cars.find((car) => car.id === carId);
  if (!current) throw new Error("car_not_found");
  assertMileageRollback(current.mileageKm, input.mileageKm, input.confirmMileageRollback);
  const at = nowIso();
  const cars = state.cars.map((car) =>
    car.id === carId
      ? {
          ...car,
          make: input.make.trim(),
          model: input.model.trim(),
          year: input.year,
          nickname: input.nickname.trim(),
          mileageKm: input.mileageKm,
          vin: input.vin?.trim() || undefined,
          notes: input.notes?.trim() || undefined,
          maintenanceIntervalsKm: {
            ...car.maintenanceIntervalsKm,
            ...(input.maintenanceIntervalsKm ?? {}),
          },
          updatedAt: at,
        }
      : car,
  );
  const next = { ...state, cars, updatedAt: at };
  await writeGarage(next);
  return { ...next, alerts: buildAlerts(next) };
}

export async function deleteCar(carId: string): Promise<GarageSnapshot> {
  const state = await readRawGarage();
  const at = nowIso();
  const next = {
    cars: state.cars.filter((car) => car.id !== carId),
    services: state.services.filter((service) => service.carId !== carId),
    reminders: state.reminders.filter((reminder) => reminder.carId !== carId),
    updatedAt: at,
  };
  await writeGarage(next);
  return { ...next, alerts: buildAlerts(next) };
}

export async function addService(
  input: GarageServiceInput,
): Promise<GarageSnapshot> {
  const state = await readRawGarage();
  const car = state.cars.find((c) => c.id === input.carId);
  if (!car) throw new Error("car_not_found");
  validateService(input, car);
  const at = nowIso();
  const service: GarageServiceRecord = {
    id: id("svc"),
    carId: input.carId,
    type: input.type,
    label: input.label?.trim() || SERVICE_TYPE_LABELS[input.type],
    date: input.date,
    mileageKm: input.mileageKm,
    cost: input.cost,
    shop: input.shop.trim() || "DIY",
    notes: input.notes?.trim() || undefined,
    receiptUrl: input.receiptUrl?.trim() || undefined,
    createdAt: at,
    updatedAt: at,
  };
  const cars = state.cars.map((c) =>
    c.id === car.id && input.mileageKm > c.mileageKm
      ? { ...c, mileageKm: input.mileageKm, updatedAt: at }
      : c,
  );
  const next = {
    ...state,
    cars,
    services: [...state.services, service],
    updatedAt: at,
  };
  await writeGarage(next);
  return { ...next, alerts: buildAlerts(next) };
}

export async function updateService(
  serviceId: string,
  input: GarageServiceInput,
): Promise<GarageSnapshot> {
  const state = await readRawGarage();
  const service = state.services.find((s) => s.id === serviceId);
  if (!service) throw new Error("service_not_found");
  const car = state.cars.find((c) => c.id === input.carId);
  if (!car) throw new Error("car_not_found");
  validateService(input, car);
  const at = nowIso();
  const services = state.services.map((s) =>
    s.id === serviceId
      ? {
          ...s,
          carId: input.carId,
          type: input.type,
          label: input.label?.trim() || SERVICE_TYPE_LABELS[input.type],
          date: input.date,
          mileageKm: input.mileageKm,
          cost: input.cost,
          shop: input.shop.trim() || "DIY",
          notes: input.notes?.trim() || undefined,
          receiptUrl: input.receiptUrl?.trim() || undefined,
          updatedAt: at,
        }
      : s,
  );
  const next = { ...state, services, updatedAt: at };
  await writeGarage(next);
  return { ...next, alerts: buildAlerts(next) };
}

export async function deleteService(serviceId: string): Promise<GarageSnapshot> {
  const state = await readRawGarage();
  const at = nowIso();
  const next = {
    ...state,
    services: state.services.filter((service) => service.id !== serviceId),
    updatedAt: at,
  };
  await writeGarage(next);
  return { ...next, alerts: buildAlerts(next) };
}

export async function addReminder(
  input: GarageReminderInput,
): Promise<GarageSnapshot> {
  const state = await readRawGarage();
  if (!state.cars.some((car) => car.id === input.carId)) throw new Error("car_not_found");
  const at = nowIso();
  const reminder: GarageReminder = {
    id: id("rem"),
    carId: input.carId,
    type: input.type,
    label: input.label.trim(),
    intervalKm: input.intervalKm,
    dueMileageKm: input.dueMileageKm,
    dueDate: input.dueDate,
    notes: input.notes?.trim() || undefined,
    createdAt: at,
    updatedAt: at,
  };
  const next = {
    ...state,
    reminders: [...state.reminders, reminder],
    updatedAt: at,
  };
  await writeGarage(next);
  return { ...next, alerts: buildAlerts(next) };
}

export function getGarageDataDirInfo() {
  return {
    dataDir: DATA_DIR,
    ephemeral: !process.env.LIFEOS_DATA_DIR && !!process.env.VERCEL,
  };
}
