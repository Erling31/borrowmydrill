"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const T = {
  surface: "#ffffff", bg: "#f3f4f1", text: "#1b1d19",
  muted: "#71756d", hair: "#e8e9e4", hair2: "#f0f1ec",
  accent: "#3f7d52", accentSoft: "#e4efe5", accentInk: "#143524",
  danger: "#c0392b",
};

type AdminUser = {
  id: string;
  email: string;
  name: string;
  neighborhood: string;
  isAdmin: boolean;
  _count: { tools: number; requests: number };
};

type AdminTool = {
  id: string;
  name: string;
  category: string | null;
  available: boolean;
  owner: { id: string; name: string };
};

const inputStyle: React.CSSProperties = {
  width: "100%", border: `1px solid ${T.hair}`, borderRadius: 10,
  padding: "9px 11px", fontSize: 14, background: T.bg, color: T.text,
};

const labelStyle: React.CSSProperties = { fontSize: 12.5, fontWeight: 600, color: T.muted, marginBottom: 4, display: "block" };

export default function AdminPanel({
  adminId,
  initialUsers,
  initialTools,
}: {
  adminId: string;
  initialUsers: AdminUser[];
  initialTools: AdminTool[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"users" | "tools">("users");

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <div style={{ background: T.surface, padding: "16px 16px 12px", borderBottom: `1px solid ${T.hair}` }}>
        <Link href="/" style={{ fontSize: 13, color: T.muted, textDecoration: "none" }}>← Tilbake</Link>
        <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", color: T.text, marginTop: 6 }}>Admin</div>
        <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
          {initialUsers.length} brukere · {initialTools.length} verktøy
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {([["users", "Brukere"], ["tools", "Verktøy"]] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                padding: "7px 16px", borderRadius: 999, fontSize: 13.5, fontWeight: 600, cursor: "pointer",
                border: `1px solid ${tab === id ? "transparent" : T.hair}`,
                background: tab === id ? T.accent : T.surface,
                color: tab === id ? T.accentInk : T.text,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {tab === "users"
          ? <UsersTab users={initialUsers} adminId={adminId} onChange={() => router.refresh()} />
          : <ToolsTab tools={initialTools} users={initialUsers} onChange={() => router.refresh()} />}
      </div>
    </div>
  );
}

// ─── Users ──────────────────────────────────────────────────────────────────

function UsersTab({ users, adminId, onChange }: { users: AdminUser[]; adminId: string; onChange: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", neighborhood: "", password: "", isAdmin: false });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Kunne ikke opprette bruker.");
      return;
    }
    setForm({ name: "", email: "", neighborhood: "", password: "", isAdmin: false });
    onChange();
  }

  async function removeUser(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    setBusyId(null);
    setConfirmId(null);
    if (res.ok) onChange();
    else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Kunne ikke slette bruker.");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Add user */}
      <details style={{ ...card() }}>
        <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 14.5, color: T.text }}>+ Legg til bruker</summary>
        <form onSubmit={addUser} style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          <div>
            <label style={labelStyle}>Navn</label>
            <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label style={labelStyle}>E-post</label>
            <input style={inputStyle} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label style={labelStyle}>Nabolag</label>
            <input style={inputStyle} value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} required />
          </div>
          <div>
            <label style={labelStyle}>Passord (minst 8 tegn)</label>
            <input style={inputStyle} type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: T.text }}>
            <input type="checkbox" checked={form.isAdmin} onChange={(e) => setForm({ ...form, isAdmin: e.target.checked })} />
            Gi admin-tilgang
          </label>
          {error && <p style={{ color: T.danger, fontSize: 13, margin: 0 }}>{error}</p>}
          <button type="submit" disabled={saving} style={primaryBtn(saving)}>
            {saving ? "Oppretter…" : "Opprett bruker"}
          </button>
        </form>
      </details>

      {/* User list */}
      <div style={card()}>
        {users.map((u, i) => (
          <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 2px", borderBottom: i === users.length - 1 ? "none" : `1px solid ${T.hair2}` }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: T.text, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</span>
                {u.isAdmin && <span style={{ fontSize: 10, fontWeight: 700, color: T.accentInk, background: T.accentSoft, padding: "1px 7px", borderRadius: 999 }}>ADMIN</span>}
              </div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {u.email} · {u.neighborhood} · {u._count.tools} verktøy
              </div>
            </div>
            {u.id === adminId ? (
              <span style={{ fontSize: 11.5, color: T.muted, fontStyle: "italic" }}>deg</span>
            ) : confirmId === u.id ? (
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => removeUser(u.id)} disabled={busyId === u.id} style={dangerBtn(busyId === u.id)}>
                  {busyId === u.id ? "…" : "Slett alt"}
                </button>
                <button onClick={() => setConfirmId(null)} style={ghostBtn()}>Avbryt</button>
              </div>
            ) : (
              <button onClick={() => setConfirmId(u.id)} style={dangerOutlineBtn()}>Slett</button>
            )}
          </div>
        ))}
      </div>
      {error && confirmId === null && <p style={{ color: T.danger, fontSize: 13 }}>{error}</p>}
    </div>
  );
}

// ─── Tools ──────────────────────────────────────────────────────────────────

function ToolsTab({ tools, users, onChange }: { tools: AdminTool[]; users: AdminUser[]; onChange: () => void }) {
  const [form, setForm] = useState({ ownerId: "", name: "", category: "", description: "", condition: "God" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function addTool(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/admin/tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Kunne ikke opprette verktøy.");
      return;
    }
    setForm({ ownerId: "", name: "", category: "", description: "", condition: "God" });
    onChange();
  }

  async function removeTool(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/admin/tools/${id}`, { method: "DELETE" });
    setBusyId(null);
    setConfirmId(null);
    if (res.ok) onChange();
    else setError("Kunne ikke slette verktøy.");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Add tool */}
      <details style={card()}>
        <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 14.5, color: T.text }}>+ Legg til verktøy</summary>
        <form onSubmit={addTool} style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          <div>
            <label style={labelStyle}>Eier</label>
            <select style={inputStyle} value={form.ownerId} onChange={(e) => setForm({ ...form, ownerId: e.target.value })} required>
              <option value="">Velg eier…</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.neighborhood})</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Navn</label>
            <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label style={labelStyle}>Kategori</label>
            <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Velg kategori…</option>
              {["El-verktøy", "Håndverktøy", "Hage", "Stiger", "Annet"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Beskrivelse</label>
            <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div>
            <label style={labelStyle}>Stand</label>
            <select style={inputStyle} value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
              {["Som ny", "God", "Brukt", "Slitt"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {error && <p style={{ color: T.danger, fontSize: 13, margin: 0 }}>{error}</p>}
          <button type="submit" disabled={saving} style={primaryBtn(saving)}>
            {saving ? "Oppretter…" : "Opprett verktøy"}
          </button>
        </form>
      </details>

      {/* Tool list */}
      <div style={card()}>
        {tools.length === 0 ? (
          <p style={{ fontSize: 13, color: T.muted, textAlign: "center", padding: 8, margin: 0 }}>Ingen verktøy.</p>
        ) : tools.map((t, i) => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 2px", borderBottom: i === tools.length - 1 ? "none" : `1px solid ${T.hair2}` }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>
                {t.owner.name} · {t.category ?? "Ukategorisert"} · {t.available ? "ledig" : "utlånt"}
              </div>
            </div>
            {confirmId === t.id ? (
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => removeTool(t.id)} disabled={busyId === t.id} style={dangerBtn(busyId === t.id)}>
                  {busyId === t.id ? "…" : "Slett"}
                </button>
                <button onClick={() => setConfirmId(null)} style={ghostBtn()}>Avbryt</button>
              </div>
            ) : (
              <button onClick={() => setConfirmId(t.id)} style={dangerOutlineBtn()}>Slett</button>
            )}
          </div>
        ))}
      </div>
      {error && <p style={{ color: T.danger, fontSize: 13 }}>{error}</p>}
    </div>
  );
}

// ─── shared style helpers ─────────────────────────────────────────────────────

function card(): React.CSSProperties {
  return { background: T.surface, border: `1px solid ${T.hair}`, borderRadius: 14, padding: 14 };
}
function primaryBtn(disabled: boolean): React.CSSProperties {
  return { background: T.accent, color: T.accentInk, border: "none", borderRadius: 10, padding: "10px 14px", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: disabled ? 0.6 : 1 };
}
function dangerBtn(disabled: boolean): React.CSSProperties {
  return { background: T.danger, color: "#fff", border: "none", borderRadius: 9, padding: "6px 11px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", opacity: disabled ? 0.6 : 1 };
}
function dangerOutlineBtn(): React.CSSProperties {
  return { background: T.surface, color: T.danger, border: `1px solid #eccac4`, borderRadius: 9, padding: "6px 11px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", flexShrink: 0 };
}
function ghostBtn(): React.CSSProperties {
  return { background: T.surface, color: T.muted, border: `1px solid ${T.hair}`, borderRadius: 9, padding: "6px 11px", fontSize: 12.5, fontWeight: 600, cursor: "pointer" };
}
