import { fetchUserAttributes, getCurrentUser, updateUserAttributes } from "aws-amplify/auth";
import {
  detectTimeZone,
  readLocalTimeZone,
  writeLocalTimeZone,
} from "./timezone";

export type PickerProfile = {
  name: string | null;
  timeZone: string;
};

export async function getPickerProfile(): Promise<PickerProfile> {
  const attrs = await fetchUserAttributes();
  const name = attrs.preferred_username?.trim() || null;
  const timeZone =
    attrs.zoneinfo?.trim() ||
    readLocalTimeZone() ||
    detectTimeZone();

  return { name, timeZone };
}

export async function getSavedPickerName(): Promise<string | null> {
  const profile = await getPickerProfile();
  return profile.name;
}

export async function getPickerName(): Promise<string> {
  const saved = await getSavedPickerName();
  if (saved) return saved;

  const attrs = await fetchUserAttributes();
  if (attrs.email?.includes("@")) {
    return attrs.email.split("@")[0] ?? attrs.email;
  }

  const { username } = await getCurrentUser();
  return username.includes("@") ? username.split("@")[0] ?? username : username;
}

export async function savePickerProfile(rawName: string, timeZone: string): Promise<{
  name: string;
  timeZone: string;
}> {
  const name = rawName.trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 24) {
    throw new Error("Name must be 2–24 characters");
  }

  writeLocalTimeZone(timeZone);

  const userAttributes: Record<string, string> = {
    preferred_username: name,
  };
  userAttributes.zoneinfo = timeZone;

  try {
    await updateUserAttributes({ userAttributes });
  } catch {
    await updateUserAttributes({
      userAttributes: { preferred_username: name },
    });
  }

  return { name, timeZone };
}

export async function savePickerName(raw: string): Promise<string> {
  const { name } = await savePickerProfile(raw, detectTimeZone());
  return name;
}

export async function getCurrentUserId(): Promise<string> {
  const { userId } = await getCurrentUser();
  return userId;
}

export { signOut } from "aws-amplify/auth";
