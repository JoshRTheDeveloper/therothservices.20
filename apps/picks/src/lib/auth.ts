import { fetchUserAttributes, getCurrentUser, signOut } from "aws-amplify/auth";

export async function getPickerName(): Promise<string> {
  const attrs = await fetchUserAttributes();
  if (attrs.preferred_username?.trim()) {
    return attrs.preferred_username.trim();
  }

  if (attrs.email?.includes("@")) {
    return attrs.email.split("@")[0] ?? attrs.email;
  }

  const { username } = await getCurrentUser();
  return username.includes("@") ? username.split("@")[0] ?? username : username;
}

export async function getCurrentUserId(): Promise<string> {
  const { userId } = await getCurrentUser();
  return userId;
}

export { signOut };
