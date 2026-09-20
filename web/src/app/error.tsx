"use client";

export default function ErrorPage({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <main className="page">
      <section className="card">
        <h1>Something went wrong</h1>
        <p className="muted">{error.message}</p>
      </section>
    </main>
  );
}
