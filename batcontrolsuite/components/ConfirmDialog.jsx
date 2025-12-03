"use client";
import React from "react";

export default function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
      {/* Centered Box */}
      <div
        className="
          bg-white border rounded-lg shadow-xl p-6 w-80 pointer-events-auto
          animate-[fadeIn_0.25s_ease-out,zoomIn_0.25s_ease-out]
        "
        style={{ zIndex: 999 }}
      >
        <p className="text-gray-800 text-center mb-4">{message}</p>

        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200 transition"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
          >
            Yes, Delete
          </button>
        </div>
      </div>

      {/* Soft light background (not blackout) */}
      <div
        className="fixed inset-0 bg-black/20 animate-fadeIn"
        style={{ zIndex: 998 }}
      />
    </div>
  );
}
