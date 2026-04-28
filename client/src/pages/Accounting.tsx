import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import {
  DollarSign, Plus, TrendingUp, TrendingDown, Download,
  FileText, Trash2, Building2
} from "lucide-react";

const INCOME_CATEGORIES = [
  { value: "rent", label: "Rent Received" },
  { value: "late_fee", label: "Late Fee" },
  { value: "parking", label: "Parking" },
  { value: "laundry", label: "Laundry" },
  { value: "pet_fee", label: "Pet Fee" },
  { value: "other_income", label: "Other Income" },
];

const EXPENSE_CATEGORIES = [
  { value: "mortgage_interest", label: "Mortgage Interest" },
  { value: "property_tax", label: "Property Tax" },
  { value: "insurance", label: "Insurance" },
  { value: "repairs", label: "Repairs & Maintenance" },
  { value: "management_fee", label: "Management Fee" },
  { value: "utilities", label: "Utilities" },
  { value: "advertising", label: "Advertising" },
  { value: "professional_fees", label: "Professional Fees" },
  { value: "travel", label: "Travel" },
  { value: "supplies", label: "Supplies" },
  { value: "depreciation", label: "Depreciation" },
  { value: "other_expense", label: "Other Expense" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];

// Special filter value sentinel — "all" means no property filter
const ALL_PROPERTIES = "__all__";

export default function Accounting() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [propertyFilter, setPropertyFilter] = useState<string>(ALL_PROPERTIES);
  const [createOpen, setCreateOpen] = useState(false);
  const [entryType, setEntryType] = useState<"income" | "expense">("income");
  const [form, setForm] = useState({
    type: "income" as "income" | "expense",
    category: "rent",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    propertyAddress: "",
    crmPropertyId: undefined as number | undefined,
    listingId: undefined as number | undefined,
  });

  const { data: entries, refetch } = trpc.accounting.list.useQuery(
    { year: selectedYear },
    { enabled: isAuthenticated, retry: false }
  );

  // Pull user's portfolio (CRM properties + active listings) for the dropdown
  const { data: crmProperties = [] } = trpc.crm.listProperties.useQuery(
    undefined,
    { enabled: isAuthenticated, retry: false }
  );
  const { data: myListings = [] } = trpc.marketplace.getMyListings.useQuery(
    undefined,
    { enabled: isAuthenticated, retry: false }
  );

  // Build a unified portfolio list — CRM properties take precedence by id,
  // listings shown if not already linked to a CRM property.
  const portfolio = useMemo(() => {
    const items: { key: string; label: string; crmPropertyId?: number; listingId?: number; address: string }[] = [];
    crmProperties.forEach((p: any) => {
      items.push({
        key: `crm:${p.id}`,
        label: p.address + (p.city ? `, ${p.city}` : ""),
        crmPropertyId: p.id,
        address: [p.address, p.city, p.state].filter(Boolean).join(", "),
      });
    });
    myListings.forEach((l: any) => {
      // skip if already linked via crm
      if (crmProperties.some((p: any) => p.listingId === l.id)) return;
      items.push({
        key: `listing:${l.id}`,
        label: l.title || l.address,
        listingId: l.id,
        address: [l.address, l.city, l.state].filter(Boolean).join(", "),
      });
    });
    return items;
  }, [crmProperties, myListings]);

  const createMutation = trpc.accounting.create.useMutation({
    onSuccess: () => {
      toast.success("Entry added");
      setCreateOpen(false);
      setForm({ type: "income", category: "rent", amount: "", date: new Date().toISOString().split("T")[0], description: "", propertyAddress: "", crmPropertyId: undefined, listingId: undefined });
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.accounting.delete.useMutation({
    onSuccess: () => { toast.success("Entry deleted"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  // Apply property filter to entries
  const filteredEntries = useMemo(() => {
    if (!entries) return [];
    if (propertyFilter === ALL_PROPERTIES) return entries;
    if (propertyFilter.startsWith("crm:")) {
      const id = parseInt(propertyFilter.slice(4));
      return entries.filter(e => e.crmPropertyId === id);
    }
    if (propertyFilter.startsWith("listing:")) {
      const id = parseInt(propertyFilter.slice(8));
      return entries.filter(e => e.listingId === id);
    }
    return entries;
  }, [entries, propertyFilter]);

  const summary = useMemo(() => {
    const totalIncome = filteredEntries.filter(e => e.type === "income").reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = filteredEntries.filter(e => e.type === "expense").reduce((sum, e) => sum + e.amount, 0);
    const byCategory: Record<string, number> = {};
    filteredEntries.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount;
    });
    return { totalIncome, totalExpenses, netIncome: totalIncome - totalExpenses, byCategory };
  }, [filteredEntries]);

  // Per-property P&L breakdown — keyed by property identity (crmPropertyId, listingId, or address)
  const perPropertyBreakdown = useMemo(() => {
    if (!entries) return [];
    const map = new Map<string, { label: string; income: number; expenses: number; count: number }>();
    entries.forEach(e => {
      const key = e.crmPropertyId
        ? `crm:${e.crmPropertyId}`
        : e.listingId
        ? `listing:${e.listingId}`
        : e.propertyAddress
        ? `addr:${e.propertyAddress}`
        : "unassigned";
      const label = e.propertyAddress || "Unassigned";
      const cur = map.get(key) ?? { label, income: 0, expenses: 0, count: 0 };
      if (e.type === "income") cur.income += e.amount;
      else cur.expenses += e.amount;
      cur.count += 1;
      map.set(key, cur);
    });
    return Array.from(map.entries())
      .map(([key, v]) => ({ key, ...v, net: v.income - v.expenses }))
      .sort((a, b) => b.net - a.net);
  }, [entries]);

  const fmt = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const exportCSV = () => {
    if (!entries) return;
    const rows = [
      ["Date", "Type", "Category", "Amount", "Property", "Description"],
      ...entries.map(e => [
        e.date,
        e.type,
        e.category,
        (e.amount / 100).toFixed(2),
        e.propertyAddress ?? "",
        e.description ?? "",
      ])
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leasely-accounting-${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  };

  const exportPDF = () => {
    if (!entries) return;
    const incomeEntries = entries.filter(e => e.type === "income");
    const expenseEntries = entries.filter(e => e.type === "expense");
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Leasely Accounting Report ${selectedYear}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #1a1a1a; }
          h1 { color: #1B4332; border-bottom: 2px solid #1B4332; padding-bottom: 10px; }
          h2 { color: #2D6A4F; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #1B4332; color: white; padding: 8px 12px; text-align: left; font-size: 12px; }
          td { padding: 7px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
          tr:nth-child(even) td { background: #f9fafb; }
          .summary { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .summary-row { display: flex; justify-content: space-between; padding: 6px 0; }
          .net { font-weight: bold; font-size: 16px; border-top: 1px solid #ccc; padding-top: 10px; margin-top: 6px; }
          .income { color: #16a34a; } .expense { color: #dc2626; }
          .footer { margin-top: 40px; font-size: 10px; color: #9ca3af; text-align: center; }
        </style>
      </head>
      <body>
        <h1>🏠 Leasely — Rental Accounting Report</h1>
        <p><strong>Tax Year:</strong> ${selectedYear} &nbsp;|&nbsp; <strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
        <div class="summary">
          <div class="summary-row"><span>Total Income</span><span class="income">${fmt(summary.totalIncome)}</span></div>
          <div class="summary-row"><span>Total Expenses</span><span class="expense">${fmt(summary.totalExpenses)}</span></div>
          <div class="summary-row net"><span>Net Income (Schedule E)</span><span>${fmt(summary.netIncome)}</span></div>
        </div>
        <h2>Income (${incomeEntries.length} entries)</h2>
        <table>
          <tr><th>Date</th><th>Category</th><th>Property</th><th>Description</th><th>Amount</th></tr>
          ${incomeEntries.map(e => `<tr><td>${e.date}</td><td>${e.category.replace("_", " ")}</td><td>${e.propertyAddress ?? "—"}</td><td>${e.description ?? "—"}</td><td class="income">${fmt(e.amount)}</td></tr>`).join("")}
          <tr><td colspan="4"><strong>Total Income</strong></td><td class="income"><strong>${fmt(summary.totalIncome)}</strong></td></tr>
        </table>
        <h2>Expenses (${expenseEntries.length} entries)</h2>
        <table>
          <tr><th>Date</th><th>Category</th><th>Property</th><th>Description</th><th>Amount</th></tr>
          ${expenseEntries.map(e => `<tr><td>${e.date}</td><td>${e.category.replace("_", " ")}</td><td>${e.propertyAddress ?? "—"}</td><td>${e.description ?? "—"}</td><td class="expense">${fmt(e.amount)}</td></tr>`).join("")}
          <tr><td colspan="4"><strong>Total Expenses</strong></td><td class="expense"><strong>${fmt(summary.totalExpenses)}</strong></td></tr>
        </table>
        <div class="footer">Generated by Leasely Pro · leasely.net · For tax purposes, consult a qualified accountant.</div>
      </body>
      </html>
    `;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    win?.print();
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Sign in required</h2>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </div>
        </div>
      </div>
    );
  }

  const incomeEntries = filteredEntries.filter(e => e.type === "income");
  const expenseEntries = filteredEntries.filter(e => e.type === "expense");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-[#1B4332]" />
              Accounting
            </h1>
            <p className="text-gray-500 mt-1">Track income and expenses · Export for taxes</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {portfolio.length > 0 && (
              <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="All properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_PROPERTIES}>All properties</SelectItem>
                  {portfolio.map(p => (
                    <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={selectedYear.toString()} onValueChange={v => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                {YEARS.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportCSV} className="gap-2">
              <Download className="w-4 h-4" /> CSV
            </Button>
            <Button variant="outline" onClick={exportPDF} className="gap-2">
              <FileText className="w-4 h-4" /> Tax PDF
            </Button>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white gap-2">
                  <Plus className="w-4 h-4" /> Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Accounting Entry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={form.type === "income" ? "default" : "outline"}
                      className={form.type === "income" ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                      onClick={() => { setForm(f => ({ ...f, type: "income", category: "rent" })); setEntryType("income"); }}
                    >
                      <TrendingUp className="w-4 h-4 mr-1" /> Income
                    </Button>
                    <Button
                      variant={form.type === "expense" ? "default" : "outline"}
                      className={form.type === "expense" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                      onClick={() => { setForm(f => ({ ...f, type: "expense", category: "repairs" })); setEntryType("expense"); }}
                    >
                      <TrendingDown className="w-4 h-4 mr-1" /> Expense
                    </Button>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Amount ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.amount}
                        onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                        placeholder="1200.00"
                      />
                    </div>
                    <div>
                      <Label>Date</Label>
                      <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <Label>Property</Label>
                    {portfolio.length > 0 ? (
                      <Select
                        value={
                          form.crmPropertyId ? `crm:${form.crmPropertyId}`
                          : form.listingId ? `listing:${form.listingId}`
                          : "manual"
                        }
                        onValueChange={(v) => {
                          if (v === "manual") {
                            setForm(f => ({ ...f, crmPropertyId: undefined, listingId: undefined, propertyAddress: "" }));
                            return;
                          }
                          const item = portfolio.find(p => p.key === v);
                          if (!item) return;
                          setForm(f => ({
                            ...f,
                            crmPropertyId: item.crmPropertyId,
                            listingId: item.listingId,
                            propertyAddress: item.address,
                          }));
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Select a property..." /></SelectTrigger>
                        <SelectContent>
                          {portfolio.map(p => (
                            <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>
                          ))}
                          <SelectItem value="manual">— Type address manually —</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input value={form.propertyAddress} onChange={e => setForm(f => ({ ...f, propertyAddress: e.target.value }))} placeholder="123 Main St, Charlotte, NC" />
                    )}
                    {!form.crmPropertyId && !form.listingId && portfolio.length > 0 && (
                      <Input
                        className="mt-2"
                        value={form.propertyAddress}
                        onChange={e => setForm(f => ({ ...f, propertyAddress: e.target.value }))}
                        placeholder="123 Main St, Charlotte, NC"
                      />
                    )}
                  </div>
                  <div>
                    <Label>Description (optional)</Label>
                    <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. January rent from Unit 2A" />
                  </div>
                  <Button
                    className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white"
                    onClick={() => createMutation.mutate({
                      type: form.type,
                      category: form.category,
                      date: form.date,
                      description: form.description || undefined,
                      propertyAddress: form.propertyAddress || undefined,
                      crmPropertyId: form.crmPropertyId,
                      listingId: form.listingId,
                      amount: Math.round(parseFloat(form.amount) * 100),
                    })}
                    disabled={!form.amount || !form.date || createMutation.isPending}
                  >
                    {createMutation.isPending ? "Saving..." : "Add Entry"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-800">{fmt(summary.totalIncome)}</div>
                  <div className="text-sm text-green-700">Total Income {selectedYear}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-8 h-8 text-red-600" />
                <div>
                  <div className="text-2xl font-bold text-red-800">{fmt(summary.totalExpenses)}</div>
                  <div className="text-sm text-red-700">Total Expenses {selectedYear}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={`border-2 ${summary.netIncome >= 0 ? "border-[#1B4332] bg-green-50" : "border-red-400 bg-red-50"}`}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <DollarSign className={`w-8 h-8 ${summary.netIncome >= 0 ? "text-[#1B4332]" : "text-red-600"}`} />
                <div>
                  <div className={`text-2xl font-bold ${summary.netIncome >= 0 ? "text-[#1B4332]" : "text-red-700"}`}>{fmt(summary.netIncome)}</div>
                  <div className="text-sm text-gray-600">Net Income (Schedule E)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Per-Property P&L Breakdown — only when no filter is active */}
        {propertyFilter === ALL_PROPERTIES && perPropertyBreakdown.length > 0 && (
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#1B4332]" />
                Per-Property P&L · {selectedYear}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left text-xs font-medium text-gray-500 px-3 py-2">Property</th>
                      <th className="text-right text-xs font-medium text-gray-500 px-3 py-2">Entries</th>
                      <th className="text-right text-xs font-medium text-gray-500 px-3 py-2">Income</th>
                      <th className="text-right text-xs font-medium text-gray-500 px-3 py-2">Expenses</th>
                      <th className="text-right text-xs font-medium text-gray-500 px-3 py-2">Net</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {perPropertyBreakdown.map(row => (
                      <tr key={row.key} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm text-gray-700">{row.label}</td>
                        <td className="px-3 py-2 text-right text-sm text-gray-500">{row.count}</td>
                        <td className="px-3 py-2 text-right text-sm text-green-700 font-medium">{fmt(row.income)}</td>
                        <td className="px-3 py-2 text-right text-sm text-red-700 font-medium">{fmt(row.expenses)}</td>
                        <td className={`px-3 py-2 text-right text-sm font-bold ${row.net >= 0 ? "text-[#1B4332]" : "text-red-700"}`}>
                          {fmt(row.net)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {(row.key.startsWith("crm:") || row.key.startsWith("listing:")) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs h-7"
                              onClick={() => setPropertyFilter(row.key)}
                            >
                              View →
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Entries Table */}
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All ({filteredEntries.length})</TabsTrigger>
            <TabsTrigger value="income">Income ({incomeEntries.length})</TabsTrigger>
            <TabsTrigger value="expense">Expenses ({expenseEntries.length})</TabsTrigger>
          </TabsList>

          {["all", "income", "expense"].map(tab => (
            <TabsContent key={tab} value={tab}>
              {(() => {
                const rows = tab === "all" ? filteredEntries : tab === "income" ? incomeEntries : expenseEntries;
                if (rows.length === 0) {
                  return (
                    <Card className="text-center py-12">
                      <CardContent>
                        <DollarSign className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No entries yet. Click "Add Entry" to get started.</p>
                      </CardContent>
                    </Card>
                  );
                }
                return (
                  <Card>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Date</th>
                            <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Type</th>
                            <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Category</th>
                            <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Property</th>
                            <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Description</th>
                            <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Amount</th>
                            <th className="px-4 py-3"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map(entry => (
                            <tr key={entry.id} className="border-b hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-sm text-gray-600">{entry.date}</td>
                              <td className="px-4 py-3">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${entry.type === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                  {entry.type}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 capitalize">{entry.category.replace("_", " ")}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 max-w-32 truncate">{entry.propertyAddress ?? "—"}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 max-w-48 truncate">{entry.description ?? "—"}</td>
                              <td className={`px-4 py-3 text-sm font-semibold text-right ${entry.type === "income" ? "text-green-700" : "text-red-700"}`}>
                                {entry.type === "income" ? "+" : "-"}{fmt(entry.amount)}
                              </td>
                              <td className="px-4 py-3">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-gray-400 hover:text-red-500 h-7 w-7 p-0"
                                  onClick={() => deleteMutation.mutate({ id: entry.id })}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                );
              })()}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
