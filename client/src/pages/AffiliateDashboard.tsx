import { useState } from "react";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  DollarSign, Users, Copy, ExternalLink, Clock, CheckCircle,
  TrendingUp, AlertCircle, FileText, ArrowRight
} from "lucide-react";

const APP_URL = window.location.origin;

export default function AffiliateDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = trpc.affiliate.getMyAffiliate.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: stats } = trpc.affiliate.getStats.useQuery(undefined, {
    enabled: !!user && data?.affiliate?.status === "active",
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Card className="bg-white/5 border-white/10 text-white max-w-md w-full mx-4">
          <CardContent className="pt-8 pb-8 text-center">
            <AlertCircle className="w-12 h-12 text-teal-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Sign in required</h2>
            <p className="text-slate-400 mb-6">Please sign in to access your affiliate dashboard.</p>
            <Button
              onClick={() => window.location.href = "/api/oauth/login?redirect=/affiliate/dashboard"}
              className="bg-teal-500 hover:bg-teal-400 text-white"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  // Not in affiliate program yet
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Card className="bg-white/5 border-white/10 text-white max-w-md w-full mx-4">
          <CardContent className="pt-8 pb-8 text-center">
            <DollarSign className="w-12 h-12 text-teal-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Join the Affiliate Program</h2>
            <p className="text-slate-400 mb-6">Earn $50 for every landlord you refer to Keycove Pro.</p>
            <Button
              onClick={() => navigate("/affiliate/signup")}
              className="bg-teal-500 hover:bg-teal-400 text-white"
            >
              Get Started <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { affiliate, w9, referrals, payouts } = data;
  const referralLink = `${APP_URL}/?ref=${affiliate.referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const statusBadge = {
    pending_w9: <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">Pending W-9</Badge>,
    active: <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30">Active</Badge>,
    suspended: <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Suspended</Badge>,
    paid_out: <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Paid Out</Badge>,
  }[affiliate.status];

  const pendingPayoutCents = (affiliate.totalEarned ?? 0) - (affiliate.totalPaid ?? 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-white">Keycove</a>
          <div className="flex items-center gap-4">
            {statusBadge}
            <a href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">
              Main Dashboard →
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Affiliate Dashboard</h1>
          <p className="text-slate-400">Track your referrals and earnings</p>
        </div>

        {/* Pending W-9 Banner */}
        {affiliate.status === "pending_w9" && (
          <Card className="bg-amber-500/10 border-amber-500/30 mb-8">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-amber-300 font-medium">W-9 required to activate your account</p>
                    <p className="text-amber-400/70 text-sm">Submit your W-9 to get your referral link and start earning.</p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/affiliate/signup")}
                  className="bg-amber-500 hover:bg-amber-400 text-white"
                >
                  Submit W-9 <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Earned",
              value: `$${((affiliate.totalEarned ?? 0) / 100).toFixed(2)}`,
              icon: DollarSign,
              color: "text-teal-400",
            },
            {
              label: "Pending Payout",
              value: `$${(pendingPayoutCents / 100).toFixed(2)}`,
              icon: Clock,
              color: "text-amber-400",
            },
            {
              label: "Paid Out",
              value: `$${((affiliate.totalPaid ?? 0) / 100).toFixed(2)}`,
              icon: CheckCircle,
              color: "text-blue-400",
            },
            {
              label: "Referrals",
              value: referrals?.length ?? 0,
              icon: Users,
              color: "text-purple-400",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="bg-white/5 border-white/10">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-xs text-slate-400">{label}</span>
                </div>
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Referral Link */}
        {affiliate.status === "active" && (
          <Card className="bg-white/5 border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="text-white text-lg">Your Referral Link</CardTitle>
              <CardDescription className="text-slate-400">
                Share this link. When someone signs up and pays for Pro, you earn $50.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-0 bg-white/10 rounded-lg px-4 py-3 font-mono text-sm text-teal-300 truncate">
                  {referralLink}
                </div>
                <Button
                  onClick={copyLink}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 flex-shrink-0"
                >
                  {copied ? (
                    <><CheckCircle className="w-4 h-4 mr-2 text-teal-400" /> Copied!</>
                  ) : (
                    <><Copy className="w-4 h-4 mr-2" /> Copy</>
                  )}
                </Button>
                <Button
                  onClick={() => window.open(referralLink, "_blank")}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 flex-shrink-0"
                >
                  <ExternalLink className="w-4 h-4 mr-2" /> Preview
                </Button>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-xs text-slate-400 mb-1">Your Code</div>
                  <div className="font-mono font-bold text-white text-lg">{affiliate.referralCode}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-xs text-slate-400 mb-1">Per Conversion</div>
                  <div className="font-bold text-teal-400 text-lg">$50.00</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-xs text-slate-400 mb-1">1099-NEC Threshold</div>
                  <div className="font-bold text-white text-lg">$600/year</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Referral History */}
        <Card className="bg-white/5 border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-400" />
              Referral History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!referrals || referrals.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Users className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p>No referrals yet. Share your link to start earning!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {referrals.map((ref) => (
                  <div key={ref.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        ref.status === "paid" ? "bg-teal-400" :
                        ref.status === "signed_up" ? "bg-amber-400" :
                        "bg-slate-500"
                      }`} />
                      <div>
                        <div className="text-sm text-white">
                          {ref.status === "paid" ? "Converted — Paid" :
                           ref.status === "signed_up" ? "Signed up — Awaiting payment" :
                           "Link clicked"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(ref.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${ref.status === "paid" ? "text-teal-400" : "text-slate-500"}`}>
                        {ref.status === "paid" ? `+$${((ref.earningAmountCents ?? 5000) / 100).toFixed(2)}` : "—"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payout History */}
        <Card className="bg-white/5 border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-teal-400" />
              Payout History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!payouts || payouts.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <DollarSign className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p>No payouts yet. Payouts are processed manually by our team.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {payouts.map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div>
                      <div className="text-sm text-white capitalize">{payout.method} payout</div>
                      <div className="text-xs text-slate-500">
                        {payout.paidAt ? new Date(payout.paidAt).toLocaleDateString() : "Pending"}
                        {payout.referenceId && ` · Ref: ${payout.referenceId}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-teal-400">
                        ${(payout.amountCents / 100).toFixed(2)}
                      </div>
                      <Badge className={`text-xs ${
                        payout.status === "completed" ? "bg-teal-500/20 text-teal-300" :
                        payout.status === "pending" ? "bg-amber-500/20 text-amber-300" :
                        "bg-slate-500/20 text-slate-300"
                      }`}>
                        {payout.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* W-9 Info */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-white font-medium">W-9 Status</p>
                  <p className="text-slate-400 text-sm">
                    {w9 ? (
                      <>Submitted · TIN ending in {w9.tinLast4} · {w9.legalName}</>
                    ) : (
                      "Not yet submitted"
                    )}
                  </p>
                </div>
              </div>
              {!w9 && (
                <Button
                  onClick={() => navigate("/affiliate/signup")}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Submit W-9
                </Button>
              )}
              {w9 && (
                <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30">
                  <CheckCircle className="w-3 h-3 mr-1" /> On file
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tax note */}
        <p className="mt-6 text-xs text-slate-600 text-center">
          Earnings of $600 or more in a calendar year require a 1099-NEC. Keycove will issue this by January 31 of the following year.
          Questions? Contact support@leasely.net
        </p>
      </div>
    </div>
  );
}
