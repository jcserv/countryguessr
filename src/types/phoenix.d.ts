// Type declarations for phoenix
declare module "phoenix" {
  export interface SocketOptions {
    params?: Record<string, unknown> | (() => Record<string, unknown>);
    transport?: new (endpoint: string) => object;
    encode?: (payload: object, callback: (encoded: string) => void) => void;
    decode?: (payload: string, callback: (decoded: object) => void) => void;
    timeout?: number;
    heartbeatIntervalMs?: number;
    reconnectAfterMs?: (tries: number) => number;
    rejoinAfterMs?: (tries: number) => number;
    logger?: (kind: string, msg: string, data: object) => void;
    longpollerTimeout?: number;
    vsn?: string;
  }

  export class Push {
    receive(status: string, callback: (response: unknown) => void): Push;
  }

  export class Channel {
    join(timeout?: number): Push;
    leave(timeout?: number): Push;
    push(event: string, payload?: object, timeout?: number): Push;
    on(event: string, callback: (payload: unknown) => void): number;
    off(event: string, ref?: number): void;
    onClose(callback: () => void): void;
    onError(callback: (reason?: string) => void): void;
  }

  export class Socket {
    constructor(endPoint: string, opts?: SocketOptions);
    connect(): void;
    disconnect(callback?: () => void, code?: number, reason?: string): void;
    isConnected(): boolean;
    channel(topic: string, params?: object): Channel;
    onOpen(callback: () => void): number;
    onClose(callback: (event: CloseEvent) => void): number;
    onError(callback: (error: unknown) => void): number;
    onMessage(callback: (message: object) => object): number;
    params(): Record<string, unknown>;
  }
}
