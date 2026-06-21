"use client";

import * as React from "react";
import { cn } from "@lib/utils";

interface DropdownMenuContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue>({
  open: false,
  onOpenChange: () => {},
});

export function DropdownMenu({
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const onOpenChange = controlledOnOpenChange ?? setInternalOpen;

  return (
    <DropdownMenuContext.Provider value={{ open, onOpenChange }}>
      <div className="relative">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
  asChild,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const { open, onOpenChange } = React.useContext(DropdownMenuContext);
  const ref = React.useRef<HTMLButtonElement>(null);

  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onOpenChange(!open);
      },
      ...props,
    });
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpenChange(!open);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  children,
  className,
  align = "start",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "end" }) {
  const { open, onOpenChange } = React.useContext(DropdownMenuContext);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-scale-in top-full mt-1",
        align === "end" ? "left-0 -translate-x-3" : "right-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  className,
  onClick,
  asChild,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  onClick?: () => void;
  asChild?: boolean;
}) {
  const { onOpenChange } = React.useContext(DropdownMenuContext);

  const handleClick = () => {
    onClick?.();
    onOpenChange(false);
  };

  if (asChild) {
    const child = children as React.ReactElement<React.HTMLAttributes<HTMLElement>>;
    return React.cloneElement(child, {
      className: cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      ),
      onClick: handleClick,
      ...(props as React.HTMLAttributes<HTMLElement>),
    });
  }

  return (
    <div
      role="menuitem"
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("-mx-1 my-1 h-px bg-border", className)}
    />
  );
}
