import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center" dir="rtl">
      <div className="mx-auto max-w-md space-y-4">
        <div className="text-8xl font-bold text-primary/20">404</div>
        <h1 className="text-3xl font-bold">الصفحة غير موجودة</h1>
        <p className="text-muted-foreground">عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.</p>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
