import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import {
  Bell, Fingerprint, LifeBuoy, BookOpen, Shield, FileText, LogOut, Trash2, ChevronRight, Loader2, User,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { TENANT_TOKEN_KEY, hasTenantSession, isNativeApp, nativePlatform } from "@/native/platform";

type PushState = "granted" | "denied" | "prompt" | "unsupported" | "loading";

/** /app/settings — account, notifications, Face ID unlock, help, sign out, delete account. */
export default function MobileSettings() {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const tenant = hasTenantSession();
  const native = isNativeApp();
  const platform = nativePlatform();
  const roles = trpc.push.myRoles.useQuery(undefined, { enabled: Boolean(user), retry: false });
  const sendTest = trpc.push.sendTest.useMutation();
  const deleteAccount = trpc.auth.deleteAccount.useMutation();

  const [push, setPush] = useState<PushState>(native ? "loading" : "unsupported");
  const [bio, setBio] = useState<{ available: boolean; label: string; on: boolean } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!native) return;
    (async () => {
      const p = await import("@/native/push");
      const perm = await p.pushPermission().catch(() => "denied" as const);
      setPush(p.pushSupported(platform as "ios" | "android") ? perm : "unsupported");
      const lock = await import("@/native/appLock");
      const info = await lock.biometryInfo();
      setBio({ ...info, on: await lock.biometricLockEnabled() });
    })();
  }, [native, platform]);

  const roleLabel = tenant && !user ? "Tenant"
    : roles.data?.isPropertyManager && !roles.data?.isLandlord ? "Property manager"
      : (user as { accountType?: string } | null)?.accountType === "renter" ? "Renter"
        : "Landlord";

  async function turnOnPush() {
    const p = await import("@/native/push");
    const perm = await p.enablePush(platform as "ios" | "android");
    setPush(perm);
    if (perm === "denied") toast.info("Notifications are off for Keycove. Turn them on in your phone's Settings app.");
    else toast.success("Notifications are on");
  }

  async function toggleBio(on: boolean) {
    const lock = await import("@/native/appLock");
    if (on && !(await lock.authenticate(`Turn on ${bio?.label ?? "biometric unlock"}`))) return;
    await lock.setBiometricLockEnabled(on);
    setBio((b) => (b ? { ...b, on } : b));
    toast.success(on ? `${bio?.label} unlock is on` : `${bio?.label} unlock is off`);
  }

  async function signOut() {
    if (user) await logout();
    try { localStorage.removeItem(TENANT_TOKEN_KEY); localStorage.removeItem("leasely_tenant_id"); } catch { /* ignore */ }
    navigate("/app", { replace: true });
  }

  async function doDelete() {
    try {
      await deleteAccount.mutateAsync();
      await logout().catch(() => {});
      toast.success("Your account has been deleted.");
      navigate("/app", { replace: true });
    } catch (err) {
      toast.error((err as Error).message || "Couldn't delete the account. Contact support@keycove.net.");
    }
  }

  const signedIn = Boolean(user) || tenant;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10">
      <div className="bg-[#0F1F4B] text-white px-5 pt-6 pb-6">
        <h1 className="text-xl font-bold">Settings</h1>
        {signedIn && (
          <div className="flex items-center gap-3 mt-4">
            <span className="h-11 w-11 rounded-full bg-white/10 flex items-center justify-center"><User className="h-5 w-5" /></span>
            <div className="min-w-0">
              <p className="font-semibold truncate">{user?.name ?? (tenant ? "Tenant portal" : "")}</p>
              <p className="text-xs text-indigo-200 truncate">{user?.email ?? ""}{user?.email ? " · " : ""}{roleLabel}</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 mt-4 space-y-4">
        {native && signedIn && (
          <Section title="Notifications">
            <Row icon={Bell} title="Push notifications"
              desc={push === "granted" ? "Rent, applications, work orders, leases and HOA dues"
                : push === "denied" ? "Off. Turn on in your phone's Settings → Keycove → Notifications."
                  : push === "unsupported" ? "Not available in this build yet"
                    : "Get alerts the moment something happens"}>
              {push === "loading" ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                : push === "prompt" ? <button className="text-sm font-semibold text-indigo-600" onClick={() => void turnOnPush()}>Turn on</button>
                  : push === "granted" ? <span className="text-xs font-semibold text-emerald-600">On</span> : null}
            </Row>
            {push === "granted" && user && (
              <button
                className="w-full text-left px-4 py-3 text-sm font-medium text-indigo-600 border-t border-slate-100"
                disabled={sendTest.isPending}
                onClick={() => sendTest.mutate(undefined, {
                  onSuccess: (r) => toast.success(r.delivered ? "Test sent. Check your notifications." : "Saved. Test pushes start once the server push keys are set."),
                  onError: (e) => toast.error(e.message),
                })}
              >
                {sendTest.isPending ? "Sending…" : "Send a test notification"}
              </button>
            )}
          </Section>
        )}

        {native && signedIn && bio?.available && (
          <Section title="Security">
            <Row icon={Fingerprint} title={`Unlock with ${bio.label}`} desc="Ask for it when you open Keycove">
              <Switch checked={bio.on} onCheckedChange={(v) => void toggleBio(v)} aria-label={`Unlock with ${bio.label}`} />
            </Row>
          </Section>
        )}

        <Section title="Help">
          <LinkRow href="/support" icon={LifeBuoy} title="Contact support" />
          <LinkRow href="/how-to-use" icon={BookOpen} title="How to use Keycove" />
          <LinkRow href="/privacy" icon={Shield} title="Privacy policy" />
          <LinkRow href="/terms" icon={FileText} title="Terms of service" />
        </Section>

        {signedIn ? (
          <Section title="Account">
            <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-sm font-medium text-slate-800" onClick={() => void signOut()}>
              <LogOut className="h-[18px] w-[18px] text-slate-500" /> Sign out
            </button>
            {user && (
              <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-sm font-medium text-red-600 border-t border-slate-100" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-[18px] w-[18px]" /> Delete account
              </button>
            )}
          </Section>
        ) : (
          <Section title="Account">
            <LinkRow href="/app" icon={User} title="Sign in" />
          </Section>
        )}

        <p className="text-center text-xs text-slate-400 pt-2">Keycove {native ? `for ${platform === "ios" ? "iPhone" : "Android"} ` : ""}1.0.0 · Leasely LLC</p>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your Keycove account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes your account and signs you out on every device. It can't be undone.
              If you have a paid plan, cancel it first so you aren't billed again. Records the law requires us to
              keep, like completed payments, are kept as described in our Privacy Policy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => void doDelete()}>
              {deleteAccount.isPending ? "Deleting…" : "Delete account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1 mb-1.5">{title}</h2>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">{children}</div>
    </section>
  );
}

function Row({ icon: Icon, title, desc, children }: { icon: typeof Bell; title: string; desc?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Icon className="h-[18px] w-[18px] text-slate-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800">{title}</p>
        {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function LinkRow({ href, icon: Icon, title }: { href: string; icon: typeof Bell; title: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3.5 border-b last:border-b-0 border-slate-100">
      <Icon className="h-[18px] w-[18px] text-slate-500 shrink-0" />
      <span className="flex-1 text-sm font-medium text-slate-800">{title}</span>
      <ChevronRight className="h-4 w-4 text-slate-300" />
    </Link>
  );
}
