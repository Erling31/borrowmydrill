"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  toolId: string;
}

export default function ToolActions({ toolId }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/tools/${toolId}`, { method: "DELETE" });
    router.push("/tools");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500">Er du sikker?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-sm font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
        >
          {deleting ? "Sletter…" : "Slett"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          Avbryt
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/tools/${toolId}/edit`}
        className="text-sm font-medium text-zinc-600 hover:text-[#1e1f21] border border-warm-200 px-3 py-1.5 rounded-lg transition-colors"
      >
        Rediger
      </Link>
      <button
        onClick={() => setConfirming(true)}
        className="text-sm font-medium text-red-500 hover:text-red-600 border border-red-200 px-3 py-1.5 rounded-lg transition-colors"
      >
        Slett
      </button>
    </div>
  );
}
