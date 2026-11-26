import { useAvailability } from "./useAvailability";
import { checkUsername } from "../api/auth";
import { isValidUsername } from "../utils/validation";

/**
 * Checks username availability.
 *
 * @param username - The requested username.
 * @returns The current availability status.
 */
export function useUsernameAvailability(username: string) {
  return useAvailability(
    username,
    isValidUsername,
    checkUsername
  );
}