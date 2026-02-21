"use client";

import { createContext, useContext, ReactNode } from "react";

interface WebSocketContextValue {
  runAPI: (endpoint: string, params?: Record<string, string>) => void;
  apiResponse: unknown;
  runningEndpoint: string | null;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export function WebSocketProvider({
  children,
  runAPI,
  apiResponse,
  runningEndpoint,
}: {
  children: ReactNode;
  runAPI: (endpoint: string, params?: Record<string, string>) => void;
  apiResponse: unknown;
  runningEndpoint: string | null;
}) {
  return (
    <WebSocketContext.Provider value={{ runAPI, apiResponse, runningEndpoint }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    // Return a no-op version if not in provider (for safety)
    return {
      runAPI: () => {},
      apiResponse: null,
      runningEndpoint: null,
    };
  }
  return context;
}
