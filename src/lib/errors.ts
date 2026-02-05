/**
 * Standardized error types for the application.
 * Provides consistent error handling across frontend components.
 */

export type AppError =
  | { type: "network"; message: string }
  | { type: "validation"; message: string; field?: string }
  | { type: "game_state"; message: string; reason: string }
  | { type: "unknown"; message: string };

/**
 * Creates a network error.
 */
export function createNetworkError(message: string): AppError {
  return { type: "network", message };
}

/**
 * Creates a validation error.
 */
export function createValidationError(
  message: string,
  field?: string,
): AppError {
  return { type: "validation", message, field };
}

/**
 * Creates a game state error.
 */
export function createGameStateError(
  message: string,
  reason: string,
): AppError {
  return { type: "game_state", message, reason };
}

/**
 * Creates an unknown error from any thrown value.
 */
export function createUnknownError(err: unknown): AppError {
  const message =
    err instanceof Error ? err.message : "An unknown error occurred";
  return { type: "unknown", message };
}

/**
 * Formats an error for display to the user.
 */
export function formatErrorMessage(error: AppError): string {
  switch (error.type) {
    case "validation":
      return error.field ? `${error.field}: ${error.message}` : error.message;
    case "game_state":
      return error.message;
    case "network":
    case "unknown":
    default:
      return error.message;
  }
}

/**
 * Type guard to check if an error is a specific type.
 */
export function isErrorType<T extends AppError["type"]>(
  error: AppError,
  type: T,
): error is Extract<AppError, { type: T }> {
  return error.type === type;
}
