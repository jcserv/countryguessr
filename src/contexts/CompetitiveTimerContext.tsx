import React, { createContext, useCallback, useContext, useState } from "react";

import type { UnifiedGameStatus } from "@/types/unified-game";

interface CompetitiveTimerState {
  timeRemaining: number | null;
  status: UnifiedGameStatus | null;
}

interface CompetitiveTimerContextValue extends CompetitiveTimerState {
  setTimerState: (state: CompetitiveTimerState) => void;
  clearTimerState: () => void;
}

const CompetitiveTimerContext = createContext<CompetitiveTimerContextValue>({
  timeRemaining: null,
  status: null,
  setTimerState: () => {},
  clearTimerState: () => {},
});

export function CompetitiveTimerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [timerState, setTimerStateInternal] = useState<CompetitiveTimerState>({
    timeRemaining: null,
    status: null,
  });

  const setTimerState = useCallback((state: CompetitiveTimerState) => {
    setTimerStateInternal(state);
  }, []);

  const clearTimerState = useCallback(() => {
    setTimerStateInternal({ timeRemaining: null, status: null });
  }, []);

  return (
    <CompetitiveTimerContext.Provider
      value={{
        ...timerState,
        setTimerState,
        clearTimerState,
      }}
    >
      {children}
    </CompetitiveTimerContext.Provider>
  );
}

export function useCompetitiveTimer() {
  return useContext(CompetitiveTimerContext);
}
