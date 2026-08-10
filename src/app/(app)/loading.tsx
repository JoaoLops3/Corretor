export default function Loading() {
  return (
    <div className="animate-fade-in">
      <div className="mb-3.5 flex items-baseline justify-between">
        <div>
          <div className="mb-2 h-3 w-24 animate-pulse rounded bg-line" />
          <div className="h-6 w-40 animate-pulse rounded bg-line" />
        </div>
        <div className="h-9 w-32 animate-pulse rounded-[10px] bg-line" />
      </div>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-[14px] bg-line" />
        ))}
      </div>
    </div>
  );
}
