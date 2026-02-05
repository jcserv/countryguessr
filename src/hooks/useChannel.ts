import { useCallback, useEffect, useRef, useState } from "react";

import type { Channel, Push } from "phoenix";

import { useSocket } from "./useSocket";

interface UseChannelOptions {
  topic: string;
  params?: Record<string, unknown>;
  onJoin?: (response: unknown) => void;
  onError?: (error: unknown) => void;
  onClose?: () => void;
}

interface UseChannelReturn {
  channel: Channel | null;
  joined: boolean;
  error: unknown;
  push: <T>(event: string, payload?: object) => Promise<T>;
  leave: () => void;
}

/**
 * Hook to manage a Phoenix channel subscription
 */
export function useChannel({
  topic,
  params = {},
  onJoin,
  onError,
  onClose,
}: UseChannelOptions): UseChannelReturn {
  const { socket, connected } = useSocket();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const channelRef = useRef<Channel | null>(null);

  // Use refs for callbacks and params to avoid re-joining on every render
  const onJoinRef = useRef(onJoin);
  const onErrorRef = useRef(onError);
  const onCloseRef = useRef(onClose);
  const paramsRef = useRef(params);

  // Keep refs up to date
  useEffect(() => {
    onJoinRef.current = onJoin;
    onErrorRef.current = onError;
    onCloseRef.current = onClose;
    paramsRef.current = params;
  });

  useEffect(() => {
    if (!socket || !connected || !topic) return;

    // Create and join the channel
    const newChannel = socket.channel(topic, paramsRef.current);
    channelRef.current = newChannel;
    setChannel(newChannel);

    newChannel
      .join()
      .receive("ok", (response) => {
        setJoined(true);
        setError(null);
        onJoinRef.current?.(response);
      })
      .receive("error", (err) => {
        setError(err);
        onErrorRef.current?.(err);
      });

    newChannel.onClose(() => {
      setJoined(false);
      onCloseRef.current?.();
    });

    return () => {
      newChannel.leave();
      setChannel(null);
      setJoined(false);
      channelRef.current = null;
    };
  }, [socket, connected, topic]);

  const push = useCallback(
    <T>(event: string, payload: object = {}): Promise<T> => {
      return new Promise((resolve, reject) => {
        if (!channelRef.current) {
          reject(new Error("Channel not connected"));
          return;
        }

        (channelRef.current.push(event, payload) as Push)
          .receive("ok", (response) => resolve(response as T))
          .receive("error", (err) => reject(err))
          .receive("timeout", () => reject(new Error("Request timeout")));
      });
    },
    [],
  );

  const leave = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.leave();
      setChannel(null);
      setJoined(false);
      channelRef.current = null;
    }
  }, []);

  return { channel, joined, error, push, leave };
}
