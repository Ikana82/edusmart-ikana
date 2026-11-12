"use client";

import { AlertTriangle, X } from "lucide-react";

 type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description: string;
  itemName?: string;
  confirmLabel?: string;
  loadingLabel?: string;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
};

export default function ConfirmDialog({
  open,
  title = "Hapus item ini?",
  description,
  itemName,
  confirmLabel = "Ya, Hapus",
  loadingLabel = "Menghapus...",
  isLoading = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <AlertTriangle size={23} />
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Tutup"
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        <h2 id="confirm-dialog-title" className="mt-4 text-lg font-bold text-gray-900">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>

        {itemName && (
          <div className="mt-3 rounded-xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800">
            {itemName}
          </div>
        )}

        <div className="mt-5 rounded-xl bg-red-50 p-3 text-xs leading-5 text-red-700">
          Tindakan ini mungkin tidak dapat dibatalkan. Pastikan item yang dipilih sudah benar.
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
