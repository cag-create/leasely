import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { trpc } from "@/lib/trpc";
import {
  LayoutDashboard, LogOut, PanelLeft, Home, Building2,
  Briefcase, Calculator, UserCircle, HeadphonesIcon, Heart,
  FileText, Sparkles, Shield, ChevronDown, Wrench, BookOpen, Award, Landmark, Rocket, Users
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import { LOGO_URL } from "@/lib/brand";

const coreMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", group: "main" },
  { icon: Home, label: "My Listings", path: "/my-listings", group: "main" },
  { icon: Heart, label: "Saved", path: "/saved", group: "main" },
];

const proMenuItems = [
  { icon: Building2, label: "Complexes", path: "/complexes", group: "pro" },
  { icon: FileText, label: "Applications", path: "/applications", group: "pro" },
  { icon: Briefcase, label: "Work Orders", path: "/work-orders", group: "pro" },
  { icon: FileText, label: "Lease Agreements", path: "/leases", group: "pro" },
  { icon: Calculator, label: "Accounting", path: "/accounting", group: "pro" },
  { icon: Landmark, label: "Payouts", path: "/payouts", group: "pro" },
  { icon: UserCircle, label: "Tenants / CRM", path: "/crm", group: "pro" },
];

const directoryMenuItems = [
  { icon: Wrench, label: "Contractors", path: "/contractors", group: "directory" },
  { icon: Award, label: "Creme Agents", path: "/agents", group: "directory" },
  { icon: Users, label: "Agent Dashboard", path: "/broker-dashboard", group: "directory" },
];

const supportMenuItems = [
  { icon: Rocket, label: "How to use Leasely", path: "/how-to-use", group: "support" },
  { icon: BookOpen, label: "Pro Guide", path: "/pro-guide", group: "support" },
  { icon: Award, label: "Agent Guide", path: "/agent-guide", group: "support" },
  { icon: HeadphonesIcon, label: "Support", path: "/support", group: "support" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  // No more `dark` wrappers — the ThemeProvider drives theme selection
  // from <App /> (defaultTheme="light"). Forcing dark here used to
  // override the provider on every dashboard page, leaving the entire
  // logged-in product stuck on a near-black background regardless of
  // user preference.
  if (loading) return <DashboardLayoutSkeleton />;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-6 p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <LayoutDashboard className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Sign in to continue</h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Access to this dashboard requires authentication.
            </p>
          </div>
          <Button
            onClick={() => { window.location.href = getLoginUrl(); }}
            className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold"
            size="lg"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}>
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
}) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const { data: me } = trpc.auth.me.useQuery(undefined, { enabled: !!user });
  const tier = (me as any)?.tier as "free" | "paid" | undefined;
  const role = (me as any)?.role as "user" | "admin" | undefined;
  const isPro = tier === "paid";
  const isAdmin = role === "admin";

  const activeMenuItem = [...coreMenuItems, ...proMenuItems, ...supportMenuItems]
    .find(item => item.path === location);

  useEffect(() => {
    if (isCollapsed) setIsResizing(false);
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  const NavItem = ({ item }: { item: typeof coreMenuItems[0] }) => {
    const isActive = location === item.path;
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={isActive}
          onClick={() => setLocation(item.path)}
          tooltip={item.label}
          className={`
            h-9 rounded-lg transition-all font-medium text-sm
            ${isActive
              ? "bg-sidebar-accent text-sidebar-primary font-semibold"
              : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
            }
          `}
        >
          <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#4F46E5]" : ""}`} />
          <span>{item.label}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar" disableTransition={isResizing}>

          {/* ── Sidebar Header ── */}
          <SidebarHeader className="h-14 border-b border-sidebar-border">
            <div className="flex items-center gap-3 px-3 h-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-sidebar-accent rounded-lg transition-colors shrink-0"
                aria-label="Toggle sidebar"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed && isPro && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#4F46E5]/15 text-[#4338CA] border border-[#4F46E5]/20 shrink-0">
                  PRO
                </span>
              )}
            </div>
          </SidebarHeader>

          {/* ── Sidebar Content ── */}
          <SidebarContent className="gap-0 py-3">

            {/* Core navigation */}
            <SidebarMenu className="px-2 gap-0.5">
              {coreMenuItems.map(item => <NavItem key={item.path} item={item} />)}
            </SidebarMenu>

            {/* Pro tools section */}
            {!isCollapsed && (
              <div className="px-4 pt-4 pb-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  {isPro ? "Pro Tools" : "Pro Tools"}
                </p>
              </div>
            )}
            {isCollapsed && <div className="h-3" />}

            <SidebarMenu className="px-2 gap-0.5">
              {proMenuItems.map(item => {
                if (!isPro) {
                  // Show locked items for free users
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        onClick={() => setLocation("/pricing")}
                        tooltip={`${item.label} — Pro only`}
                        className="h-9 rounded-lg text-muted-foreground/50 hover:text-muted-foreground hover:bg-sidebar-accent/40 transition-all"
                      >
                        <item.icon className="h-4 w-4 shrink-0 opacity-50" />
                        <span className="opacity-50">{item.label}</span>
                        {!isCollapsed && (
                          <Sparkles className="h-3 w-3 ml-auto text-[#4F46E5]/60 shrink-0" />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }
                return <NavItem key={item.path} item={item} />;
              })}
            </SidebarMenu>

            {/* Admin section */}
            {isAdmin && (
              <>
                {!isCollapsed && (
                  <div className="px-4 pt-4 pb-1">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-500/70">
                      Admin
                    </p>
                  </div>
                )}
                <SidebarMenu className="px-2 gap-0.5">
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={location === "/admin"}
                      onClick={() => setLocation("/admin")}
                      tooltip="Admin Panel"
                      className={`h-9 rounded-lg transition-all font-medium text-sm ${location === "/admin" ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400" : "text-amber-600/70 hover:text-amber-700 hover:bg-amber-50/60 dark:hover:bg-amber-950/40"}`}
                    >
                      <Shield className="h-4 w-4 shrink-0" />
                      <span>Admin Panel</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </>
            )}

            {/* Directory section */}
            {!isCollapsed && (
              <div className="px-4 pt-4 pb-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Directory
                </p>
              </div>
            )}
            {isCollapsed && <div className="h-3" />}
            <SidebarMenu className="px-2 gap-0.5">
              {directoryMenuItems.map(item => <NavItem key={item.path} item={item} />)}
            </SidebarMenu>

            {/* Brand logo — centered in the empty space between Directory and Support */}
            {!isCollapsed && (
              <div className="flex-1 flex items-center justify-center px-3 min-h-0">
                <img
                  src={LOGO_URL}
                  alt="Leasely"
                  className="h-20 w-auto rounded-lg bg-white p-2 shadow-sm"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}

            {/* Support */}
            <div className="mt-auto">
              <SidebarMenu className="px-2 gap-0.5">
                {supportMenuItems.map(item => <NavItem key={item.path} item={item} />)}
              </SidebarMenu>
            </div>

            {/* Upgrade CTA for free users */}
            {!isPro && !isCollapsed && (
              <div className="mx-3 mt-3 mb-1 p-3 rounded-xl bg-gradient-to-br from-[#4F46E5]/8 to-[#4F46E5]/8 border border-[#4F46E5]/15">
                <p className="text-xs font-semibold text-foreground">Unlock Pro Portal</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 mb-2">Applications, payouts, AI screening & more</p>
                <button
                  onClick={() => setLocation("/pricing")}
                  className="w-full text-xs font-semibold py-1.5 px-3 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="h-3 w-3" /> Upgrade — $25/mo
                </button>
              </div>
            )}
          </SidebarContent>

          {/* ── Sidebar Footer ── */}
          <SidebarFooter className="p-2 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 rounded-xl px-2 py-2 hover:bg-sidebar-accent transition-colors w-full text-left">
                  <Avatar className="h-8 w-8 border border-sidebar-border shrink-0">
                    <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-sidebar-foreground truncate leading-none">
                          {user?.name || "Account"}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {isPro ? "Pro Landlord" : "Free Plan"}
                        </p>
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="w-52 mb-1">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive gap-2"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Resize handle */}
        {!isCollapsed && (
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[#4F46E5]/30 active:bg-[#4F46E5]/50 transition-colors z-50"
            onMouseDown={() => setIsResizing(true)}
          />
        )}
      </div>

      {/* ── Main content ── */}
      <SidebarInset>
        {isMobile && (
          <div className="flex border-b border-border h-14 items-center justify-between bg-background/95 px-4 backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-8 w-8 rounded-lg" />
              <span className="text-sm font-semibold text-foreground">
                {activeMenuItem?.label ?? "Dashboard"}
              </span>
            </div>
            {isPro && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#4F46E5]/10 text-[#4338CA] border border-[#4F46E5]/20">
                PRO
              </span>
            )}
          </div>
        )}
        <main className="flex-1 min-h-screen bg-background">
          <div className="p-6 md:p-8 max-w-[1400px]">
            {children}
          </div>
        </main>
      </SidebarInset>
    </>
  );
}
