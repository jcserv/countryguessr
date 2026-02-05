// Distinct player colors for competitive mode
// Colors are chosen to be visually distinct and accessible
export const PLAYER_COLORS = [
  "#3b82f6", // blue-500
  "#ef4444", // red-500
  "#22c55e", // green-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#14b8a6", // teal-500
  "#f97316", // orange-500
] as const;

export type PlayerColor = (typeof PLAYER_COLORS)[number];

/**
 * Get a color for a player based on their index in the player list
 * Colors cycle if there are more players than colors
 */
export function getPlayerColor(playerIndex: number): PlayerColor {
  return PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
}

/**
 * Get a color for a player ID based on a stable ordering
 * Uses the player's position in the sorted list of player IDs
 */
export function getPlayerColorById(
  playerId: string,
  allPlayerIds: string[],
): PlayerColor {
  const sortedIds = [...allPlayerIds].sort();
  const index = sortedIds.indexOf(playerId);
  return getPlayerColor(index >= 0 ? index : 0);
}

/**
 * Map of player IDs to their assigned colors
 * This ensures stable color assignment even as players join/leave
 */
export function createPlayerColorMap(
  playerIds: string[],
): Map<string, PlayerColor> {
  const colorMap = new Map<string, PlayerColor>();
  const sortedIds = [...playerIds].sort();

  sortedIds.forEach((id, index) => {
    colorMap.set(id, getPlayerColor(index));
  });

  return colorMap;
}
