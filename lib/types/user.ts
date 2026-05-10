export type UserProfile = {
  name: string;
  program: string;
  cycle: string;
  timezone: string;
};

export type UserGoals = {
  priorities: string[];
  focusAreas: string[];
};

export type CardKey =
  | "ticktick"
  | "calendar"
  | "health"
  | "finance"
  | "cars"
  | "research"
  | "applications"
  | "journal";

export type VisibleCards = Record<CardKey, boolean>;

export type UserHealth = {
  sleepTargetHours: number;
  recoveryGoal: number;
  habits: string[];
};

export type CalendarPreferences = {
  selectedCalendarIds: string[] | null;
  updatedAt: string | null;
};

export type IntegrationProvider = "google" | "ticktick" | "apple_health";

export type EncryptedTokens = {
  ciphertext: string;
  iv: string;
};

export type IntegrationRecord = {
  encryptedTokens: EncryptedTokens;
  scope?: string;
  connectedAt: string;
  // SHA-256 hex of the API key (only used by webhook auth; lets the ingest
  // route compare without decrypting on every request).
  apiKeyFingerprint?: string;
};

export type UserState = {
  onboardingCompletedAt: string | null;
  profile: UserProfile;
  goals: UserGoals;
  visibleCards: VisibleCards;
  health: UserHealth;
  calendar: CalendarPreferences;
  integrations: Partial<Record<IntegrationProvider, IntegrationRecord>>;
};

export type PublicUserState = Omit<UserState, "integrations"> & {
  integrations: Record<
    IntegrationProvider,
    { connected: boolean; connectedAt: string | null }
  >;
};

export const DEFAULT_USER_STATE: UserState = {
  onboardingCompletedAt: null,
  profile: {
    name: "",
    program: "",
    cycle: "",
    timezone: "America/Toronto",
  },
  goals: {
    priorities: [],
    focusAreas: [],
  },
  visibleCards: {
    ticktick: true,
    calendar: true,
    health: true,
    finance: true,
    cars: true,
    research: true,
    applications: true,
    journal: true,
  },
  health: {
    sleepTargetHours: 8,
    recoveryGoal: 80,
    habits: [],
  },
  calendar: {
    selectedCalendarIds: null,
    updatedAt: null,
  },
  integrations: {},
};
