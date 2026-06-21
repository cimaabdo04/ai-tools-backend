"use client";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center" dir="rtl">
      <div className="mx-auto max-w-md space-y-4">
        <div className="text-6xl">⚠️</div>
        <h1 className="text-3xl font-bold">حدث خطأ</h1>
        <p className="text-muted-foreground">عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.</p>
        <button
          onClick={reset}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
