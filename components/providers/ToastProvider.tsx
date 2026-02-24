"use client";

import { ToastProvider as ToastProviderUI } from "@/components/ui/Toast";
import { ReactNode } from "react";

export function ToastProvider({ children }: { children: ReactNode }) {
  return <ToastProviderUI>{children}</ToastProviderUI>;
}
