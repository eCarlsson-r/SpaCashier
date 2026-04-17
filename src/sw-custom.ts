/// <reference lib="webworker" />

import offlineQueue from './lib/offlineQueue';

declare const self: ServiceWorkerGlobalScope;

/**
 * Extracts method, URL, headers, and body from a Request object.
 */
export async function serializeRequest(
  request: Request
): Promise<{ method: string; url: string; headers: Record<string, string>; body: string }> {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const body = await request.text();

  return {
    method: request.method,
    url: request.url,
    headers,
    body,
  };
}

async function handleWriteRequest(request: Request): Promise<Response> {
  if (navigator.onLine) {
    return fetch(request);
  }

  const op = await serializeRequest(request);
  await offlineQueue.enqueue({
    method: op.method as 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: op.url,
    headers: op.headers,
    body: op.body,
  });

  return new Response(JSON.stringify({ queued: true }), {
    status: 202,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function sendMessageToClients(message: unknown) {
  const allClients = await self.clients.matchAll({ includeUncontrolled: true });
  for (const client of allClients) {
    client.postMessage(message);
  }
}

async function flushPendingOperations(): Promise<void> {
  const pending = await offlineQueue.getPending();
  for (const op of pending) {
    await offlineQueue.markSyncing(op.id);
    try {
      const request = new Request(op.url, {
        method: op.method,
        headers: new Headers(op.headers),
        body: op.body || undefined,
      });

      const response = await fetch(request);
      if (response.ok) {
        await offlineQueue.remove(op.id);
        await sendMessageToClients({ type: 'SYNC_SUCCESS', operationId: op.id });
      } else if (response.status >= 400 && response.status < 500) {
        await offlineQueue.remove(op.id);
        await sendMessageToClients({
          type: 'SYNC_FAILED',
          operationId: op.id,
          status: response.status,
          url: op.url,
        });
      } else {
        await offlineQueue.markFailed(op.id);
        await sendMessageToClients({
          type: 'SYNC_FAILED',
          operationId: op.id,
          status: response.status,
          url: op.url,
        });
      }
    } catch (error) {
      await offlineQueue.markFailed(op.id);
      await sendMessageToClients({
        type: 'SYNC_FAILED',
        operationId: op.id,
        status: 0,
        url: op.url,
      });
    }
  }
}

self.addEventListener('message', (event: ExtendableMessageEvent) => {
  const data = event.data ?? {};
  if (data.type === 'FLUSH_QUEUE') {
    event.waitUntil(flushPendingOperations());
  }

  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    event.respondWith(handleWriteRequest(request));
  }
});
