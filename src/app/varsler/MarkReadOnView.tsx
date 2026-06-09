"use client";

import { useEffect } from "react";

export default function MarkReadOnView() {
  useEffect(() => {
    const t = setTimeout(() => {
      fetch("/api/notifications", { method: "PATCH" }).catch(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, []);

  return null;
}
