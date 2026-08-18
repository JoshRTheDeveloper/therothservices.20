import { defineAuth } from "@aws-amplify/backend";

/**
 * Email/password Cognito for the family picks PWA.
 * Self sign-up is disabled in backend.ts — invite users via Cognito console / AdminCreateUser.
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    preferredUsername: {
      mutable: true,
      required: false,
    },
  },
});
