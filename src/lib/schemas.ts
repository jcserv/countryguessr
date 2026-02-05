import { z } from "zod";

/**
 * Zod schemas for validating WebSocket payloads from the server.
 * Provides runtime validation to catch malformed or unexpected data.
 */

// Player schema
const PlayerPayloadSchema = z.object({
  id: z.string(),
  nickname: z.string(),
  claimed_countries: z.array(z.string()),
  is_host: z.boolean(),
  is_connected: z.boolean(),
  lives: z.number(),
  is_eliminated: z.boolean(),
});

// Full game state from server
export const GameStatePayloadSchema = z.object({
  game_id: z.string(),
  status: z.enum(["lobby", "playing", "finished"]),
  host_id: z.string(),
  players: z.record(z.string(), PlayerPayloadSchema),
  claimed_countries: z.record(z.string(), z.string()),
  time_remaining: z.number().nullable(),
  started_at: z.number().nullable(),
  ended_at: z.number().nullable(),
});

// Player joined event
export const PlayerJoinedPayloadSchema = z.object({
  player_id: z.string(),
  nickname: z.string(),
  is_host: z.boolean(),
});

// Player left event
export const PlayerLeftPayloadSchema = z.object({
  player_id: z.string(),
});

// Country claimed event
export const CountryClaimedPayloadSchema = z.object({
  player_id: z.string(),
  country_code: z.string(),
});

// Game started event
export const GameStartedPayloadSchema = z.object({
  started_at: z.number(),
});

// Ranking entry
const RankingEntrySchema = z.object({
  player_id: z.string(),
  nickname: z.string(),
  claimed_count: z.number(),
  lives_remaining: z.number(),
  is_eliminated: z.boolean(),
});

// Game ended event
export const GameEndedPayloadSchema = z.object({
  ended_at: z.number(),
  winner_id: z.string().nullable(),
  rankings: z.array(RankingEntrySchema),
});

// Timer tick event
export const TimerTickPayloadSchema = z.object({
  time_remaining: z.number(),
});

// Life lost event
export const LifeLostPayloadSchema = z.object({
  player_id: z.string(),
  lives_remaining: z.number(),
});

// Player eliminated event
export const PlayerEliminatedPayloadSchema = z.object({
  player_id: z.string(),
});

// Claim country response
export const ClaimCountryResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

// Error response from channel
export const ChannelErrorResponseSchema = z.object({
  reason: z.union([
    z.literal("invalid_country_code"),
    z.literal("already_claimed"),
    z.literal("game_not_playing"),
    z.literal("not_in_game"),
    z.literal("rate_limited"),
    z.string(), // Allow other error reasons
  ]),
});

// Export inferred types for use in TypeScript
export type ValidatedGameStatePayload = z.infer<typeof GameStatePayloadSchema>;
export type ValidatedPlayerJoinedPayload = z.infer<
  typeof PlayerJoinedPayloadSchema
>;
export type ValidatedPlayerLeftPayload = z.infer<
  typeof PlayerLeftPayloadSchema
>;
export type ValidatedCountryClaimedPayload = z.infer<
  typeof CountryClaimedPayloadSchema
>;
export type ValidatedGameStartedPayload = z.infer<
  typeof GameStartedPayloadSchema
>;
export type ValidatedGameEndedPayload = z.infer<typeof GameEndedPayloadSchema>;
export type ValidatedTimerTickPayload = z.infer<typeof TimerTickPayloadSchema>;
export type ValidatedClaimCountryResponse = z.infer<
  typeof ClaimCountryResponseSchema
>;
export type ValidatedLifeLostPayload = z.infer<typeof LifeLostPayloadSchema>;
export type ValidatedPlayerEliminatedPayload = z.infer<
  typeof PlayerEliminatedPayloadSchema
>;

/**
 * Safely parse a payload with a schema.
 * Returns the parsed data on success, or null on failure.
 * Logs validation errors to console in development.
 */
export function safeParsePayload<T>(
  schema: z.ZodSchema<T>,
  payload: unknown,
  eventName: string,
): T | null {
  const result = schema.safeParse(payload);
  if (result.success) {
    return result.data;
  }
  // eslint-disable-next-line no-console
  console.error(`Invalid ${eventName} payload:`, result.error.format());
  return null;
}
