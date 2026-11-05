"use client";

import { useCallback, useEffect, useState } from "react";
import {
  readDemoData,
  updateDemoData,
  type DemoData,
} from "@/lib/demo-store";

const EMPTY_DATA: DemoData = {
  tasks: [],
  habits: [],
  standups: [],
  events: [],
};

export function useDemoData() {
  const [data, setData] = useState<DemoData>(EMPTY_DATA);

  useEffect(() => {
    setData(readDemoData());
    const sync = () => setData(readDemoData());
    window.addEventListener("planify-demo-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("planify-demo-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = useCallback((updater: (current: DemoData) => DemoData) => {
    const next = updateDemoData(updater);
    setData(next);
    return next;
  }, []);

  return { data, update };
}
