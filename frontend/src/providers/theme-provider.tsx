"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ReactNode, type ComponentProps } from "react";

interface Props {
  children: ReactNode;
  props?: Omit<ComponentProps<typeof NextThemesProvider>, "children">;
}

export function ThemeProvider({ children, props }: Props) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
