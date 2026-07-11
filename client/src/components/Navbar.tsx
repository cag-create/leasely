import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  Map, PlusCircle, LayoutDashboard, Heart, Menu, X,
  LogOut, ChevronDown, Sparkles, Search, Building2,
  Headphones, Shield, Settings, Wrench, Bell, CheckCheck, Trash2
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LOGO_URL } from "@/lib/brand";

function timeAgo(d: string | Date) {
  const t = typeof d === "string" ? new Date(d) : d;
  const s = Math.floor((Date.now() - t.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function NotificationBell() {
  const utils = trpc.useUtils();
  const { data } = trpc.notifications.list.useQuery(undefined, {
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  });
  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => utils.notifications.list.invalidate(),
  });
  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => utils.notifications.list.invalidate(),
  });
  const items = (data?.items ?? []) as any[];
  const unread = data?.unread ?? 0;

  function onItemClick(n: any) {
    if (!n.readAt) markRead.mutate({ id: n.id });
    if (n.link) window.location.href = n.link;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-secondary transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5 text-muted-foreground" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#4F46E5] text-[#3A2410] text-[10px] font-bold flex items-center justify-center border-2 border-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 max-h-[28rem] overflow-hidden flex flex-col">
        <div className="px-3 py-2 border-b border-border flex items-center justify-between">
          <p className="text-sm font-semibold">Notifications</p>
          {unread > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          )}
        </div>
        <div className="overflow-y-auto flex-1">
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground">
              You're all caught up.
            </div>
          ) : (
            items.map((n) => (
              <button
                key={n.id}
                onClick={() => onItemClick(n)}
                className={`w-full text-left px-3 py-2.5 border-b border-border/50 last:border-b-0 hover:bg-secondary/60 transition-colors ${
                  !n.readAt ? "bg-amber-50/60" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  {!n.readAt && (
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-[#4F46E5] shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{n.title}</p>
                    {n.body && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.body}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/80 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { data: me } = trpc.auth.me.useQuery(undefined, { enabled: isAuthenticated });
  const accountType = (me as any)?.accountType as "renter" | "landlord" | null | undefined;
  const tier = (me as any)?.tier as "free" | "paid" | undefined;
  const role = (me as any)?.role as "user" | "admin" | undefined;
  const isPro = tier === "paid";
  const isLandlord = accountType === "landlord";
  const isRenter = accountType === "renter";
  const isAdmin = role === "admin";
  const needsOnboarding = isAuthenticated && !accountType;

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { logout(); window.location.href = "/"; }
  });
  const deleteAccountMutation = trpc.auth.deleteAccount.useMutation({
    onSuccess: () => { logout(); window.location.href = "/"; }
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const isActive = (path: string) =>
    location === path || (path !== "/" && location.startsWith(path));

  // Logged-in users land in their app (dashboard/browse), not the marketing site.
  const logoHref = !isAuthenticated
    ? "/"
    : isLandlord
      ? "/dashboard"
      : isRenter
        ? "/marketplace"
        : "/";

  const NavLink = ({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) => (
    <Link href={href}>
      <span className={`
        relative px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer
        ${isActive(href)
          ? "text-[#0A1628] bg-gray-100"
          : "text-gray-500 hover:text-[#0A1628] hover:bg-gray-100/70"
        }
        ${className}
      `}>
        {children}
      </span>
    </Link>
  );

  return (
    <>
      <header className={`
        sticky top-0 z-50 transition-all duration-300
        ${scrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm"
          : "bg-white/90 backdrop-blur-md border-b border-gray-100/60"
        }
      `}>
        <div className="container">
          <div className="flex items-center justify-between h-[76px]">

            {/* ── Logo ── */}
            <Link href={logoHref} className="flex items-center shrink-0 group">
              <img
                src={LOGO_URL}
                alt="Keycove"
                className="h-14 md:h-16 w-auto transition-opacity group-hover:opacity-80 drop-shadow-sm"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden md:flex items-center gap-0.5">
              <NavLink href="/marketplace"><span className="flex items-center gap-1.5"><Search className="h-3.5 w-3.5" />Browse</span></NavLink>
              <NavLink href="/marketplace/map"><span className="flex items-center gap-1.5"><Map className="h-3.5 w-3.5" />Map</span></NavLink>

              {isRenter && (
                <NavLink href="/saved"><span className="flex items-center gap-1.5"><Heart className="h-3.5 w-3.5" />Saved</span></NavLink>
              )}

              {isLandlord && (
                <>
                  <NavLink href="/dashboard"><span className="flex items-center gap-1.5"><LayoutDashboard className="h-3.5 w-3.5" />Dashboard</span></NavLink>
                  <NavLink href="/list-property"><span className="flex items-center gap-1.5"><PlusCircle className="h-3.5 w-3.5" />List Property</span></NavLink>
                </>
              )}

              {/* Already-Pro users go straight to their tools; everyone else sees the upgrade page. */}
              <NavLink href={isPro ? "/crm" : "/pro"} className="text-[#4F46E5] hover:text-[#4338CA]">
                <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" />{isPro ? "Pro Tools" : "Pro"}</span>
              </NavLink>
              <NavLink href="/contractors"><span className="flex items-center gap-1.5"><Wrench className="h-3.5 w-3.5" />Contractors</span></NavLink>
              <NavLink href="/pricing">Pricing</NavLink>
              <NavLink href="/support"><span className="flex items-center gap-1.5"><Headphones className="h-3.5 w-3.5" />Support</span></NavLink>

              {isAdmin && (
                <NavLink href="/admin" className="text-amber-600">
                  <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" />Admin</span>
                </NavLink>
              )}

              {needsOnboarding && (
                <NavLink href="/onboarding" className="text-amber-600">
                  <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" />Complete Setup</span>
                </NavLink>
              )}
            </nav>

            {/* ── Right side ── */}
            <div className="hidden md:flex items-center gap-2">
              {!isAuthenticated ? (
                <>
                  <a href={getLoginUrl()}>
                    <Button variant="ghost" size="sm" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                      Sign In
                    </Button>
                  </a>
                  <a href={getLoginUrl()}>
                    <Button size="sm" className="text-sm font-semibold bg-[#4F46E5] hover:bg-[#4338CA] text-white gap-1.5 shadow-sm">
                      <Sparkles className="h-3.5 w-3.5" />
                      Get Started Free
                    </Button>
                  </a>
                </>
              ) : (
                <>
                  {isPro && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#4F46E5]/10 text-[#4338CA] border border-[#4F46E5]/20">
                      <Sparkles className="h-3 w-3" /> Pro
                    </span>
                  )}

                  {isLandlord && !isPro && (
                    <Link href="/pricing">
                      <Button size="sm" variant="outline" className="text-xs font-semibold gap-1.5 border-amber-300/60 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950">
                        <Sparkles className="h-3.5 w-3.5" /> Upgrade
                      </Button>
                    </Link>
                  )}

                  <NotificationBell />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 rounded-full border border-border pl-1 pr-2.5 py-0.5 hover:bg-secondary transition-colors">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-foreground max-w-[5rem] truncate">
                          {user?.name?.split(" ")[0] ?? "Account"}
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60 p-1">
                      <div className="px-3 py-2.5 border-b border-border mb-1">
                        <p className="text-sm font-semibold truncate text-foreground">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
                        <div className="mt-2">
                          {isRenter && <Badge variant="secondary" className="text-xs">Renter</Badge>}
                          {isLandlord && !isPro && <Badge variant="secondary" className="text-xs">Free Plan</Badge>}
                          {isPro && <Badge className="text-xs font-semibold bg-[#4F46E5]/10 text-[#4338CA] border-[#4F46E5]/20">Pro Landlord</Badge>}
                          {isAdmin && <Badge className="text-xs font-semibold bg-amber-100 text-amber-700 border-amber-200 ml-1">Admin</Badge>}
                        </div>
                      </div>

                      {isRenter && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/saved" className="flex items-center gap-2.5 cursor-pointer text-sm">
                              <Heart className="h-4 w-4 text-muted-foreground" /> Saved Listings
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/marketplace" className="flex items-center gap-2.5 cursor-pointer text-sm">
                              <Search className="h-4 w-4 text-muted-foreground" /> Browse Rentals
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}

                      {isLandlord && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard" className="flex items-center gap-2.5 cursor-pointer text-sm">
                              <LayoutDashboard className="h-4 w-4 text-muted-foreground" /> Dashboard
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/list-property" className="flex items-center gap-2.5 cursor-pointer text-sm">
                              <PlusCircle className="h-4 w-4 text-muted-foreground" /> List a Property
                            </Link>
                          </DropdownMenuItem>
                          {isPro && (
                            <>
                              <DropdownMenuItem asChild>
                                <Link href="/complexes" className="flex items-center gap-2.5 cursor-pointer text-sm">
                                  <Building2 className="h-4 w-4 text-muted-foreground" /> Apartment Complexes
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href="/applications" className="flex items-center gap-2.5 cursor-pointer text-sm">
                                  <Settings className="h-4 w-4 text-muted-foreground" /> Applications
                                </Link>
                              </DropdownMenuItem>
                            </>
                          )}
                          {!isPro && (
                            <DropdownMenuItem asChild>
                              <Link href="/pricing" className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-[#4338CA]">
                                <Sparkles className="h-4 w-4" /> Upgrade to Pro — $29/mo
                              </Link>
                            </DropdownMenuItem>
                          )}
                        </>
                      )}

                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/admin" className="flex items-center gap-2.5 cursor-pointer text-sm text-amber-700">
                              <Shield className="h-4 w-4" /> Admin Panel
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => logoutMutation.mutate()}
                        className="flex items-center gap-2.5 cursor-pointer text-sm text-destructive focus:text-destructive"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          if (window.confirm("Delete your account permanently? This cannot be undone. All your listings will be removed.")) {
                            deleteAccountMutation.mutate();
                          }
                        }}
                        className="flex items-center gap-2.5 cursor-pointer text-xs text-red-400 hover:text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete Account
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>

            {/* ── Mobile hamburger ── */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white/98 backdrop-blur-xl pt-[76px]">
          <nav className="container py-6 flex flex-col gap-1">
            {[
              { href: "/marketplace", label: "Browse Rentals", icon: <Search className="h-4 w-4" /> },
              { href: "/marketplace/map", label: "Map View", icon: <Map className="h-4 w-4" /> },
              ...(isRenter ? [{ href: "/saved", label: "Saved Listings", icon: <Heart className="h-4 w-4" /> }] : []),
              ...(isLandlord ? [
                { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
                { href: "/list-property", label: "List Property", icon: <PlusCircle className="h-4 w-4" /> },
                ...(isPro ? [
                  { href: "/complexes", label: "Apartment Complexes", icon: <Building2 className="h-4 w-4" /> },
                  { href: "/applications", label: "Applications", icon: <Settings className="h-4 w-4" /> },
                ] : []),
              ] : []),
              { href: "/pro", label: "Pro Features", icon: <Sparkles className="h-4 w-4" /> },
              { href: "/contractors", label: "Contractors", icon: <Wrench className="h-4 w-4" /> },
              { href: "/pricing", label: "Pricing", icon: null },
              { href: "/support", label: "Support", icon: <Headphones className="h-4 w-4" /> },
              ...(isAdmin ? [{ href: "/admin", label: "Admin Panel", icon: <Shield className="h-4 w-4" /> }] : []),
            ].map(({ href, label, icon }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
                <span className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors
                  ${isActive(href) ? "bg-gray-100 text-[#0A1628]" : "text-gray-500 hover:bg-gray-100/70 hover:text-[#0A1628]"}
                `}>
                  {icon}
                  {label}
                </span>
              </Link>
            ))}

            <div className="mt-4 pt-4 border-t border-border">
              {!isAuthenticated ? (
                <div className="space-y-2">
                  <a href={getLoginUrl()} className="block">
                    <Button className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold gap-2">
                      <Sparkles className="h-4 w-4" /> Get Started Free
                    </Button>
                  </a>
                  <a href={getLoginUrl()} className="block">
                    <Button variant="outline" className="w-full font-medium">
                      Sign In
                    </Button>
                  </a>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="px-4 py-2">
                    <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { logoutMutation.mutate(); setMobileOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-destructive hover:bg-destructive/10 w-full transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
