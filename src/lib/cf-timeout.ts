/**
 * Fetch with a timeout that always clears its timer, so no dangling timer is
 * left behind for Workers-style runtimes to trip over.
 */
export async function fetchWithTimeout(
  url: string | URL,
  init: RequestInit & { timeoutMs: number },
): Promise<Response> {
  const { timeoutMs, ...rest } = init;
  const controller = new AbortController();
  const id = setTimeout(
    () => controller.abort(new DOMException("The operation was aborted due to timeout", "TimeoutError")),
    timeoutMs,
  );
  try {
    return await fetch(url, { ...rest, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}
