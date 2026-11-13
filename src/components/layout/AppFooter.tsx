"use client";

type AppFooterProps = {
  dark: boolean;
};

export default function AppFooter({ dark }: AppFooterProps) {
  return (
    <footer
      className={`border-t pt-5 text-center text-xs ${
        dark
          ? "border-[#33334b] text-slate-400"
          : "border-gray-200 text-slate-500"
      }`}
    >
      © 2026 Edusmart by Ikanuraisma. All rights reserved.
    </footer>
  );
}
