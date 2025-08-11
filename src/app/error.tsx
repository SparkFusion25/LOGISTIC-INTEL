'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  console.error('Route error:', error);
  return (
    <main style={{ padding: 24 }}>
      <h1>Something went wrong</h1>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </main>
  );
}