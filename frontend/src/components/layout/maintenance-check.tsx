"use client";

import { type ReactNode } from "react";
import { useSettings } from "@components/tracking/use-settings";

interface MaintenanceCheckProps {
  children: ReactNode;
}

export function MaintenanceCheck({ children }: MaintenanceCheckProps) {
  const { settings } = useSettings();

  if (settings?.maintenanceEnabled) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <div className="mx-auto max-w-md space-y-4">
          <div className="text-6xl">🔧</div>
          <h1 className="text-3xl font-bold">تحت الصيانة</h1>
          <p className="text-muted-foreground">
            {settings.maintenanceMessage || "الموقع قيد الصيانة حاليًا. نعتذر عن الإزعاج، سنعود قريبًا!"}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
