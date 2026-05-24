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
  Headphones, Shield, Settings, Wrench
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/112528410/Ucb4CaDiJcuyDWNAe95Wyq/leasely-logo-corrected_6f0929ef.png";

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
          <div className="flex items-center justify-between h-[60px]">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center shrink-0 group">
              <img
                src={LOGO_URL}
                alt="Leasely"
                className="h-10 w-auto transition-opacity group-hover:opacity-80"
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

              <NavLink href="/pro" className="text-[#F5A623] hover:text-[#E8951A]">
                <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" />Pro</span>
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
                    <Button size="sm" className="text-sm font-semibold bg-[#F5A623] hover:bg-[#E8951A] text-[#062018] gap-1.5 shadow-sm">
                      <Sparkles className="h-3.5 w-3.5" />
                      Get Started Free
                    </Button>
                  </a>
                </>
              ) : (
                <>
                  {isPro && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F5A623]/10 text-[#E8951A] border border-[#F5A623]/20">
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
                          {isPro && <Badge className="text-xs font-semibold bg-[#F5A623]/10 text-[#E8951A] border-[#F5A623]/20">Pro Landlord</Badge>}
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
                              <Link href="/pricing" className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-[#E8951A]">
                                <Sparkles className="h-4 w-4" /> Upgrade to Pro — $25/mo
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
        <div className="md:hidden fixed inset-0 z-40 bg-white/98 backdrop-blur-xl pt-[60px]">
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
                    <Button className="w-full bg-[#F5A623] hover:bg-[#E8951A] text-[#062018] font-semibold gap-2">
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
