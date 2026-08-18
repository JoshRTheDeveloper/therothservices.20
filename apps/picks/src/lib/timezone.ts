export const TIME_ZONES = [
  { id: "America/New_York", label: "Eastern (ET)" },
  { id: "America/Chicago", label: "Central (CT)" },
  { id: "America/Denver", label: "Mountain (MT)" },
  { id: "America/Phoenix", label: "Arizona (no DST)" },
  { id: "America/Los_Angeles", label: "Pacific (PT)" },
  { id: "America/Anchorage", label: "Alaska (AKT)" },
  { id: "Pacific/Honolulu", label: "Hawaii (HT)" },
] as const;

const STORAGE_KEY = "roth-picks-timezone";

export function detectTimeZone(): string {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (TIME_ZONES.some((entry) => entry.id === zone)) return zone;
    return zone || "America/Chicago";
  } catch {
    return "America/Chicago";
  }
}

export function readLocalTimeZone(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeLocalTimeZone(zone: string) {
  localStorage.setItem(STORAGE_KEY, zone);
}

export function formatKickoff(iso: string, timeZone: string): string {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  });
}
