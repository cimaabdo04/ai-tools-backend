"use client";

import * as React from "react";
import { cn } from "@lib/utils";

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue>({
  value: "",
  onValueChange: () => {},
});

export function Tabs({
  children,
  value,
  defaultValue,
  onValueChange,
  className,
}: {
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const currentValue = value ?? internalValue;
  const handleChange = onValueChange ?? setInternalValue;

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  children,
  value,
  className,
  disabled,
  ...props
}: React.HTMLAttributes<HTMLButtonElement> & {
  value: string;
  disabled?: boolean;
}) {
  const { value: selectedValue, onValueChange } = React.useContext(TabsContext);
  const isActive = selectedValue === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive && "bg-background text-foreground shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  children,
  value,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const { value: selectedValue } = React.useContext(TabsContext);
  if (selectedValue !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
