import React from "react";

import { renderHook, waitFor } from "@testing-library/react";
import type { Push } from "phoenix";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  SocketContext,
  type SocketContextValue,
} from "@/contexts/SocketContext";

import { useChannel } from "./useChannel";

// Mock channel implementation
function createMockChannel() {
  const eventHandlers: Record<string, (payload: unknown) => void> = {};
  let joinCallback: ((response: unknown) => void) | null = null;
  let errorCallback: ((error: unknown) => void) | null = null;
  let closeCallback: (() => void) | null = null;

  return {
    join: vi.fn(() => ({
      receive: vi.fn((event: string, callback: (arg: unknown) => void) => {
        if (event === "ok") {
          joinCallback = callback;
        } else if (event === "error") {
          errorCallback = callback;
        }
        return {
          receive: vi.fn(
            (event2: string, callback2: (arg: unknown) => void) => {
              if (event2 === "ok") {
                joinCallback = callback2;
              } else if (event2 === "error") {
                errorCallback = callback2;
              }
              return { receive: vi.fn() };
            },
          ),
        };
      }),
    })),
    leave: vi.fn(),
    on: vi.fn((event: string, callback: (payload: unknown) => void) => {
      eventHandlers[event] = callback;
    }),
    off: vi.fn((event: string) => {
      delete eventHandlers[event];
    }),
    onClose: vi.fn((callback: () => void) => {
      closeCallback = callback;
    }),
    push: vi.fn(() => {
      const pushMock = {
        receive: vi.fn(() => pushMock),
      };
      return pushMock as unknown as Push;
    }),
    // Test helpers to trigger callbacks
    _triggerJoin: (response: unknown) => joinCallback?.(response),
    _triggerError: (error: unknown) => errorCallback?.(error),
    _triggerClose: () => closeCallback?.(),
    _triggerEvent: (event: string, payload: unknown) =>
      eventHandlers[event]?.(payload),
  };
}

type MockChannel = ReturnType<typeof createMockChannel>;

// Mock socket
function createMockSocket(mockChannel: MockChannel) {
  return {
    channel: vi.fn(() => mockChannel),
    isConnected: vi.fn(() => true),
  };
}

// Wrapper component that provides SocketContext
function createWrapper(contextValue: SocketContextValue) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      SocketContext.Provider,
      { value: contextValue },
      children,
    );
  };
}

describe("useChannel", () => {
  let mockChannel: MockChannel;
  let mockSocket: ReturnType<typeof createMockSocket>;
  let contextValue: SocketContextValue;

  beforeEach(() => {
    mockChannel = createMockChannel();
    mockSocket = createMockSocket(mockChannel);
    contextValue = {
      socket: mockSocket as unknown as SocketContextValue["socket"],
      playerId: "test-player-id",
      connected: true,
      connecting: false,
      error: null,
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns initial state before connection", () => {
    const { result } = renderHook(() => useChannel({ topic: "game:test" }), {
      wrapper: createWrapper({ ...contextValue, connected: false }),
    });

    expect(result.current.channel).toBeNull();
    expect(result.current.joined).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("joins channel when socket is connected", async () => {
    const onJoin = vi.fn();
    const { result } = renderHook(
      () => useChannel({ topic: "game:test", onJoin }),
      { wrapper: createWrapper(contextValue) },
    );

    expect(mockSocket.channel).toHaveBeenCalledWith("game:test", {});
    expect(mockChannel.join).toHaveBeenCalled();

    // Simulate successful join
    mockChannel._triggerJoin({ game_id: "test" });

    await waitFor(() => {
      expect(result.current.joined).toBe(true);
    });

    expect(onJoin).toHaveBeenCalledWith({ game_id: "test" });
    expect(result.current.error).toBeNull();
  });

  it("handles join errors", async () => {
    const onError = vi.fn();
    const { result } = renderHook(
      () => useChannel({ topic: "game:test", onError }),
      { wrapper: createWrapper(contextValue) },
    );

    // Simulate join error
    mockChannel._triggerError({ reason: "invalid_game" });

    await waitFor(() => {
      expect(result.current.error).toEqual({ reason: "invalid_game" });
    });

    expect(onError).toHaveBeenCalledWith({ reason: "invalid_game" });
  });

  it("handles channel close", async () => {
    const onClose = vi.fn();
    const { result } = renderHook(
      () => useChannel({ topic: "game:test", onClose }),
      { wrapper: createWrapper(contextValue) },
    );

    // Simulate successful join first
    mockChannel._triggerJoin({});
    await waitFor(() => {
      expect(result.current.joined).toBe(true);
    });

    // Simulate close
    mockChannel._triggerClose();

    await waitFor(() => {
      expect(result.current.joined).toBe(false);
    });

    expect(onClose).toHaveBeenCalled();
  });

  it("passes params to channel creation", () => {
    const params = { nickname: "TestPlayer", player_id: "abc123" };
    renderHook(() => useChannel({ topic: "game:test", params }), {
      wrapper: createWrapper(contextValue),
    });

    expect(mockSocket.channel).toHaveBeenCalledWith("game:test", params);
  });

  it("leaves channel on unmount", async () => {
    const { result, unmount } = renderHook(
      () => useChannel({ topic: "game:test" }),
      { wrapper: createWrapper(contextValue) },
    );

    // Simulate successful join
    mockChannel._triggerJoin({});
    await waitFor(() => {
      expect(result.current.joined).toBe(true);
    });

    unmount();

    expect(mockChannel.leave).toHaveBeenCalled();
  });

  it("leave function disconnects channel", async () => {
    const { result } = renderHook(() => useChannel({ topic: "game:test" }), {
      wrapper: createWrapper(contextValue),
    });

    // Simulate successful join
    mockChannel._triggerJoin({});
    await waitFor(() => {
      expect(result.current.joined).toBe(true);
    });

    result.current.leave();

    expect(mockChannel.leave).toHaveBeenCalled();
    await waitFor(() => {
      expect(result.current.joined).toBe(false);
    });
  });

  it("does not join if socket is not connected", () => {
    renderHook(() => useChannel({ topic: "game:test" }), {
      wrapper: createWrapper({
        ...contextValue,
        connected: false,
        socket: null,
      }),
    });

    expect(mockSocket.channel).not.toHaveBeenCalled();
  });

  it("does not join if topic is empty", () => {
    renderHook(() => useChannel({ topic: "" }), {
      wrapper: createWrapper(contextValue),
    });

    expect(mockSocket.channel).not.toHaveBeenCalled();
  });
});
