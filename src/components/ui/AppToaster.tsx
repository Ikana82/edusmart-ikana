"use client";

import { Toaster } from "sonner";

export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={3500}
      toastOptions={{
        classNames: {
          toast: "rounded-xl shadow-lg",
          title: "text-sm font-semibold",
          description: "text-xs",
        },
      }}
    />
  );
}
