"use client";

import { resetDemoData } from "@/lib/demo-store";

export function DemoBanner() {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-950 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-100">
      <div>
        <span className="font-semibold">Demo mode</span>
        <span className="ml-2 text-indigo-800 dark:text-indigo-200">
          Sample data · Changes are saved only in this browser
        </span>
      </div>
      <button
        type="button"
        onClick={resetDemoData}
        className="rounded-lg border border-indigo-300 bg-white px-3 py-1.5 font-medium text-indigo-900 transition hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-100 dark:hover:bg-indigo-900"
      >
        Reset demo data
      </button>
    </div>
  );
}
