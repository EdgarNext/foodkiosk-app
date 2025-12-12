// app/reports/_components/ReportsSkeleton.js
export default function ReportsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <div className="h-4 w-24 rounded bg-border-subtle/60" />
        <div className="h-8 w-64 rounded bg-border-subtle/60" />
        <div className="h-4 w-full max-w-xl rounded bg-border-subtle/60" />
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 w-28 rounded-xl bg-border-subtle/60" />
        ))}
        <div className="ml-auto h-10 w-36 rounded-xl bg-border-subtle/60" />
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border-subtle bg-app p-4"
          >
            <div className="h-4 w-24 rounded bg-border-subtle/60" />
            <div className="mt-2 h-7 w-32 rounded bg-border-subtle/60" />
            <div className="mt-3 h-3 w-40 rounded bg-border-subtle/60" />
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border-subtle bg-app p-4"
          >
            <div className="h-4 w-40 rounded bg-border-subtle/60" />
            <div className="mt-4 h-52 w-full rounded bg-border-subtle/60" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border-subtle bg-app p-4">
        <div className="h-4 w-56 rounded bg-border-subtle/60" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 w-full rounded bg-border-subtle/60" />
          ))}
        </div>
      </div>
    </div>
  );
}
