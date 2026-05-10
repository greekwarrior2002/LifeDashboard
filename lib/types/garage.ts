export type GarageServiceType =
  | "oil_change"
  | "brakes"
  | "air_filter"
  | "cabin_filter"
  | "battery"
  | "tires"
  | "timing_service"
  | "clutch"
  | "inspection"
  | "other";

export type GarageReminderType =
  | "oil_change"
  | "air_filter"
  | "cabin_filter"
  | "brakes"
  | "tires"
  | "timing_service"
  | "custom";

export type GarageServiceRecord = {
  id: string;
  carId: string;
  type: GarageServiceType;
  label: string;
  date: string;
  mileageKm: number;
  cost: number;
  shop: string;
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type GarageReminder = {
  id: string;
  carId: string;
  type: GarageReminderType;
  label: string;
  intervalKm?: number;
  dueMileageKm?: number;
  dueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type GarageCar = {
  id: string;
  make: string;
  model: string;
  year: number;
  nickname: string;
  mileageKm: number;
  vin?: string;
  notes?: string;
  maintenanceIntervalsKm: {
    oil_change: number;
    air_filter: number;
    cabin_filter: number;
    timing_service: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type GarageAlertTone = "good" | "warn" | "danger" | "neutral";

export type GarageAlert = {
  carId: string;
  label: string;
  detail: string;
  tone: GarageAlertTone;
  kmRemaining?: number;
};

export type GarageState = {
  cars: GarageCar[];
  services: GarageServiceRecord[];
  reminders: GarageReminder[];
  updatedAt: string;
};

export type GarageSnapshot = GarageState & {
  alerts: GarageAlert[];
};

export type GarageCarInput = {
  make: string;
  model: string;
  year: number;
  nickname: string;
  mileageKm: number;
  vin?: string;
  notes?: string;
  maintenanceIntervalsKm?: Partial<GarageCar["maintenanceIntervalsKm"]>;
  confirmMileageRollback?: boolean;
};

export type GarageServiceInput = {
  carId: string;
  type: GarageServiceType;
  label?: string;
  date: string;
  mileageKm: number;
  cost: number;
  shop: string;
  notes?: string;
  receiptUrl?: string;
};

export type GarageReminderInput = {
  carId: string;
  type: GarageReminderType;
  label: string;
  intervalKm?: number;
  dueMileageKm?: number;
  dueDate?: string;
  notes?: string;
};

export const SERVICE_TYPE_LABELS: Record<GarageServiceType, string> = {
  oil_change: "Oil change",
  brakes: "Brakes",
  air_filter: "Engine air filter",
  cabin_filter: "Cabin air filter",
  battery: "Battery",
  tires: "Tires",
  timing_service: "Timing service",
  clutch: "Clutch",
  inspection: "Inspection",
  other: "Other",
};
