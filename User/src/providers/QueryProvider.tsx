'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  if (!(WebSocket.prototype as any).__patchedForHmr) {
    (WebSocket.prototype as any).__patchedForHmr = true;
    const originalSend = WebSocket.prototype.send;
    WebSocket.prototype.send = function (data: any) {
      if (this.readyState === WebSocket.CONNECTING) {
        this.addEventListener("open", () => {
          try {
            originalSend.call(this, data);
          } catch {}
        }, { once: true });
      } else if (this.readyState === WebSocket.OPEN) {
        originalSend.call(this, data);
      }
    };
  }
}

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
