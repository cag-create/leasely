import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import { CheckCircle2, FileText, Loader2, Plus, Shield, Trash2 } from "lucide-react";

/**
 * Admin: state-template CRUD.
 *
 * Lets us add a lease template for a new state (NV, FL, TX…) without
 * editing seed-templates.ts and redeploying. The 2026-05-31 pipeline
 * audit flagged this as the #1 blocker to scaling beyond NC + TN: the
 * approval flow falls back to the generic "ALL" template when a
 * state-specific template doesn't exist, which works but is not
 * statute-correct.
 *
 * Workflow: create the template shell → save initial version (HTML +
 * variables + citations + disclosures) → it becomes the active version
 * automatically. To revise: save another version (autoactivates) or
 * call `activate` to roll back to an older one.
 */

const STATE_CODES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC","ALL"];

const CATEGORIES = [
  { value: "standard_residential", label: "Standard Residential" },
  { value: "coliving_room_rental", label: "Coliving Room Rental" },
  { value: "generic", label: "Generic (fallback)" },
] as const;

type Category = typeof CATEGORIES[number]["value"];

export default function AdminLeaseTemplates() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const templatesQ = trpc.adminLeaseTemplates.list.useQuery(undefined, { enabled: !!user });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user || (user as any).role !== "admin") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="max-w-md text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
              <Shield className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
            <p className="text-muted-foreground">Admin-only.</p>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-5 w-5 text-amber-500" />
              <h1 className="text-2xl font-bold text-foreground">Lease Templates</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Add a state-specific lease, edit clauses, and version revisions. Active version is what
              gets auto-rendered on application approval.
            </p>
          </div>
          <Button onClick={() => { setShowCreate(true); setSelectedId(null); }}>
            <Plus className="h-4 w-4 mr-1.5" /> New Template
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
          <TemplateList
            templates={templatesQ.data ?? []}
            loading={templatesQ.isLoading}
            selectedId={selectedId}
            onSelect={(id) => { setSelectedId(id); setShowCreate(false); }}
          />

          <div>
            {showCreate ? (
              <CreateTemplatePanel onCreated={(id) => {
                setShowCreate(false);
                setSelectedId(id);
                void templatesQ.refetch();
              }} />
            ) : selectedId ? (
              <EditTemplatePanel
                templateId={selectedId}
                template={(templatesQ.data ?? []).find(t => t.id === selectedId)}
                onDeleted={() => {
                  setSelectedId(null);
                  void templatesQ.refetch();
                }}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center text-sm text-muted-foreground">
                Select a template on the left, or create a new one.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function TemplateList({
  templates, loading, selectedId, onSelect,
}: {
  templates: Array<{ id: number; state: string; category: string; name: string }>;
  loading: boolean;
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  const grouped = useMemo(() => {
    const m = new Map<string, typeof templates>();
    for (const t of templates) {
      const arr = m.get(t.state) ?? [];
      arr.push(t);
      m.set(t.state, arr);
    }
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [templates]);

  return (
    <div className="rounded-2xl border border-border bg-card p-3 space-y-3 self-start">
      {loading && <div className="p-4 text-sm text-muted-foreground">Loading…</div>}
      {!loading && grouped.length === 0 && (
        <div className="p-4 text-sm text-muted-foreground">No templates yet. Create one to start.</div>
      )}
      {grouped.map(([state, list]) => (
        <div key={state}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground px-2 mb-1">
            {state}
          </p>
          <div className="space-y-0.5">
            {list.map(t => (
              <button
                key={t.id}
                onClick={() => onSelect(t.id)}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedId === t.id ? "bg-amber-500/10 text-foreground font-semibold" : "hover:bg-muted/50"
                }`}
              >
                {t.name}
                <span className="block text-[10px] text-muted-foreground font-normal">
                  {t.category.replace(/_/g, " ")}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CreateTemplatePanel({ onCreated }: { onCreated: (id: number) => void }) {
  const [state, setState] = useState("");
  const [category, setCategory] = useState<Category>("standard_residential");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const createMut = trpc.adminLeaseTemplates.create.useMutation({
    onSuccess: (r) => {
      toast.success(`Template created (id=${r.templateId}). Now add the initial version.`);
      onCreated(r.templateId);
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <h2 className="font-bold text-lg">New Template</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">State</Label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="mt-1.5 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Select state…</option>
            {STATE_CODES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</Label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="mt-1.5 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Nevada Standard Residential Lease"
          className="mt-1.5"
        />
      </div>
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="One-line summary shown to landlords in the picker."
          rows={2}
          className="mt-1.5"
        />
      </div>
      <Button
        disabled={!state || !name || createMut.isPending}
        onClick={() => createMut.mutate({ state, category, name, description: description || undefined })}
        className="w-full"
      >
        {createMut.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</> : "Create Template"}
      </Button>
    </div>
  );
}

function EditTemplatePanel({
  templateId, template, onDeleted,
}: {
  templateId: number;
  template?: { id: number; state: string; category: string; name: string; activeVersionId: number | null };
  onDeleted: () => void;
}) {
  const versionsQ = trpc.adminLeaseTemplates.versions.useQuery({ templateId });
  const [bodyHtml, setBodyHtml] = useState("");
  const [variables, setVariables] = useState("");
  const [citations, setCitations] = useState("");
  const [disclosures, setDisclosures] = useState("");
  const [changeNote, setChangeNote] = useState("");

  // Prefill from the currently-active version (or latest if none active)
  // so admins can iterate on the existing body rather than starting blank.
  useEffect(() => {
    const list = versionsQ.data ?? [];
    if (list.length === 0) {
      setBodyHtml(""); setVariables(""); setCitations(""); setDisclosures("");
      return;
    }
    const active = list.find(v => v.id === template?.activeVersionId) ?? list[0];
    setBodyHtml(active.bodyHtml);
    setVariables(safeJoin(active.variables));
    setCitations(safeJoin(active.citations));
    setDisclosures(safeJoin(active.disclosures));
  }, [versionsQ.data, template?.activeVersionId]);

  const utils = trpc.useUtils();
  const saveMut = trpc.adminLeaseTemplates.saveVersion.useMutation({
    onSuccess: (r) => {
      toast.success(`Version ${r.versionId} saved & activated`);
      setChangeNote("");
      void versionsQ.refetch();
      void utils.adminLeaseTemplates.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  const activateMut = trpc.adminLeaseTemplates.activate.useMutation({
    onSuccess: () => {
      toast.success("Version activated");
      void versionsQ.refetch();
      void utils.adminLeaseTemplates.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = trpc.adminLeaseTemplates.softDelete.useMutation({
    onSuccess: () => {
      toast.success("Template deleted");
      onDeleted();
    },
    onError: (e) => toast.error(e.message),
  });

  function handleSave() {
    const splitLines = (s: string) => s.split(/\n+/).map(x => x.trim()).filter(Boolean);
    saveMut.mutate({
      templateId,
      bodyHtml,
      variables: splitLines(variables),
      citations: splitLines(citations),
      disclosures: splitLines(disclosures),
      changeNote: changeNote || undefined,
    });
  }

  if (!template) {
    return <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-6 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="font-bold text-lg">{template.name}</h2>
            <p className="text-xs text-muted-foreground">
              {template.state} · {template.category.replace(/_/g, " ")}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm("Soft-delete this template? Versions are preserved.")) {
                deleteMut.mutate({ templateId });
              }
            }}
            disabled={deleteMut.isPending}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h3 className="font-semibold text-sm">Edit & Save New Version</h3>
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Body HTML (use {`{{placeholder}}`} for variables)
          </Label>
          <Textarea
            value={bodyHtml}
            onChange={(e) => setBodyHtml(e.target.value)}
            rows={16}
            className="mt-1.5 font-mono text-xs"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Variables (one per line)
            </Label>
            <Textarea
              value={variables}
              onChange={(e) => setVariables(e.target.value)}
              rows={6}
              placeholder="landlord_name&#10;tenant_name&#10;monthly_rent"
              className="mt-1.5 font-mono text-xs"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Citations (one per line)
            </Label>
            <Textarea
              value={citations}
              onChange={(e) => setCitations(e.target.value)}
              rows={6}
              placeholder="Nev. Rev. Stat. § 118A.242"
              className="mt-1.5 font-mono text-xs"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Disclosures (one per line)
            </Label>
            <Textarea
              value={disclosures}
              onChange={(e) => setDisclosures(e.target.value)}
              rows={6}
              placeholder="Federal Lead-Paint Disclosure (pre-1978)"
              className="mt-1.5 font-mono text-xs"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Change Note</Label>
          <Input
            value={changeNote}
            onChange={(e) => setChangeNote(e.target.value)}
            placeholder="What changed in this version?"
            className="mt-1.5"
          />
        </div>
        <Button onClick={handleSave} disabled={saveMut.isPending || !bodyHtml} className="w-full">
          {saveMut.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : "Save New Version (auto-activates)"}
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <h3 className="font-semibold text-sm">Version History</h3>
        {(versionsQ.data ?? []).length === 0 && (
          <p className="text-xs text-muted-foreground">No versions yet — save one above.</p>
        )}
        {(versionsQ.data ?? []).map(v => {
          const isActive = v.id === template.activeVersionId;
          return (
            <div key={v.id} className="flex items-center justify-between gap-3 border-t border-border pt-3 first:border-t-0 first:pt-0">
              <div>
                <p className="text-sm font-semibold">
                  v{v.version}
                  {isActive && <Badge variant="outline" className="ml-2 text-emerald-600 border-emerald-300">active</Badge>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {v.changeNote || <em>no change note</em>} · {new Date(v.createdAt as any).toLocaleString()}
                </p>
              </div>
              {!isActive && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => activateMut.mutate({ templateId, versionId: v.id })}
                  disabled={activateMut.isPending}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Activate
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function safeJoin(raw: string | null | undefined): string {
  if (!raw) return "";
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr.join("\n");
  } catch { /* fall through */ }
  return String(raw);
}
