import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import {
  Wrench, Plus, AlertTriangle, Clock, CheckCircle2,
  Truck, Bot, Search, ChevronRight, Phone, Mail, MapPin
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-yellow-100 text-yellow-800",
  dispatched: "bg-blue-100 text-blue-800",
  vendor_confirmed: "bg-purple-100 text-purple-800",
  in_progress: "bg-orange-100 text-orange-800",
  resolved: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-700",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  emergency: "bg-red-100 text-red-800",
};

const CATEGORIES = [
  "plumbing", "electrical", "hvac", "appliance",
  "structural", "pest_control", "cleaning", "landscaping", "other"
];

export default function WorkOrders() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [createOpen, setCreateOpen] = useState(false);
  const [findVendorOpen, setFindVendorOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [findVendorData, setFindVendorData] = useState({ trade: "", city: "", state: "" });
  const [aiOutreach, setAiOutreach] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "other",
    priority: "medium" as "low" | "medium" | "high" | "emergency",
    propertyAddress: "",
    tenantName: "",
    tenantEmail: "",
    tenantPhone: "",
    vendorId: undefined as number | undefined,
  });

  const { data: workOrders, refetch } = trpc.workOrders.list.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: vendors } = trpc.vendors.list.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });

  const createMutation = trpc.workOrders.create.useMutation({
    onSuccess: (data) => {
      toast.success("Work order created", {
        description: data.aiSummary ? `AI: ${data.aiSummary.slice(0, 80)}...` : "Work order submitted.",
      });
      setCreateOpen(false);
      setForm({ title: "", description: "", category: "other", priority: "medium", propertyAddress: "", tenantName: "", tenantEmail: "", tenantPhone: "", vendorId: undefined });
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.workOrders.update.useMutation({
    onSuccess: () => { toast.success("Work order updated"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const findVendorMutation = trpc.workOrders.findVendor.useMutation({
    onSuccess: (data) => {
      setAiOutreach(data.outreachEmail);
      toast.success("AI outreach email drafted");
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Sign in required</h2>
            <p className="text-gray-500 mb-4">Please sign in to access Work Orders.</p>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </div>
        </div>
      </div>
    );
  }

  const open = workOrders?.filter(w => w.status === "open").length ?? 0;
  const dispatched = workOrders?.filter(w => w.status === "dispatched" || w.status === "vendor_confirmed" || w.status === "in_progress").length ?? 0;
  const resolved = workOrders?.filter(w => w.status === "resolved").length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Wrench className="w-8 h-8 text-[#1B4332]" />
              Work Orders
            </h1>
            <p className="text-gray-500 mt-1">AI-powered maintenance dispatch and tracking</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white gap-2">
                <Plus className="w-4 h-4" /> New Work Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-[#1B4332]" />
                  Create Work Order
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <p className="text-sm text-gray-500 bg-green-50 border border-green-200 rounded-lg p-3">
                  <Bot className="w-4 h-4 inline mr-1 text-[#1B4332]" />
                  Our AI will automatically confirm receipt and summarize the issue. If a vendor is assigned, they'll be notified immediately.
                </p>
                <div>
                  <Label>Issue Title *</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Leaking kitchen faucet" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the issue in detail..." rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace("_", " ")}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as any }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Property Address</Label>
                  <Input value={form.propertyAddress} onChange={e => setForm(f => ({ ...f, propertyAddress: e.target.value }))} placeholder="123 Main St, Charlotte, NC" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Tenant Name</Label>
                    <Input value={form.tenantName} onChange={e => setForm(f => ({ ...f, tenantName: e.target.value }))} placeholder="John Doe" />
                  </div>
                  <div>
                    <Label>Tenant Email</Label>
                    <Input value={form.tenantEmail} onChange={e => setForm(f => ({ ...f, tenantEmail: e.target.value }))} placeholder="tenant@email.com" />
                  </div>
                  <div>
                    <Label>Tenant Phone</Label>
                    <Input value={form.tenantPhone} onChange={e => setForm(f => ({ ...f, tenantPhone: e.target.value }))} placeholder="(704) 555-0100" />
                  </div>
                </div>
                {vendors && vendors.length > 0 && (
                  <div>
                    <Label>Assign Vendor (optional)</Label>
                    <Select value={form.vendorId?.toString() ?? ""} onValueChange={v => setForm(f => ({ ...f, vendorId: v ? parseInt(v) : undefined }))}>
                      <SelectTrigger><SelectValue placeholder="Select a vendor to auto-dispatch" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No vendor (save as open)</SelectItem>
                        {vendors.map(v => (
                          <SelectItem key={v.id} value={v.id.toString()}>{v.name} — {v.trade ?? "General"}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button
                  className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white"
                  onClick={() => createMutation.mutate(form)}
                  disabled={!form.title || createMutation.isPending}
                >
                  {createMutation.isPending ? "Creating & notifying..." : "Create Work Order"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-800">{open}</div>
                <div className="text-sm text-yellow-700">Open</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <Truck className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-800">{dispatched}</div>
                <div className="text-sm text-blue-700">In Progress</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-800">{resolved}</div>
                <div className="text-sm text-green-700">Resolved</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Work Orders List */}
        {!workOrders || workOrders.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No work orders yet</h3>
              <p className="text-gray-500 mb-4">Create your first work order and let AI handle dispatch.</p>
              <Button onClick={() => setCreateOpen(true)} className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white">
                <Plus className="w-4 h-4 mr-2" /> Create Work Order
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {workOrders.map(order => (
              <Card key={order.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedOrder(order)}>
                <CardContent className="py-4 px-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status ?? "open"]}`}>
                          {(order.status ?? "open").replace("_", " ")}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLORS[order.priority ?? "medium"]}`}>
                          {order.priority}
                        </span>
                        <span className="text-xs text-gray-400 capitalize">{order.category?.replace("_", " ")}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 truncate">{order.title}</h3>
                      {order.propertyAddress && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {order.propertyAddress}
                        </p>
                      )}
                      {order.aiSummary && (
                        <p className="text-xs text-[#1B4332] mt-1 flex items-start gap-1">
                          <Bot className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-1">{order.aiSummary}</span>
                        </p>
                      )}
                      {order.vendorName && (
                        <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                          <Truck className="w-3 h-3" /> Assigned to {order.vendorName}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Work Order Detail Dialog */}
        {selectedOrder && (
          <Dialog open={!!selectedOrder} onOpenChange={() => { setSelectedOrder(null); setAiOutreach(""); }}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-[#1B4332]" />
                  {selectedOrder.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[selectedOrder.status ?? "open"]}`}>
                    {(selectedOrder.status ?? "open").replace("_", " ")}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${PRIORITY_COLORS[selectedOrder.priority ?? "medium"]}`}>
                    {selectedOrder.priority} priority
                  </span>
                </div>

                {selectedOrder.aiSummary && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-[#1B4332] flex items-center gap-1 mb-1">
                      <Bot className="w-4 h-4" /> AI Summary
                    </p>
                    <p className="text-sm text-gray-700">{selectedOrder.aiSummary}</p>
                  </div>
                )}

                {selectedOrder.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                    <p className="text-sm text-gray-600">{selectedOrder.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {selectedOrder.propertyAddress && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Property</p>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" /> {selectedOrder.propertyAddress}
                      </p>
                    </div>
                  )}
                  {selectedOrder.tenantName && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Tenant</p>
                      <p className="text-sm font-medium">{selectedOrder.tenantName}</p>
                      {selectedOrder.tenantPhone && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {selectedOrder.tenantPhone}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {selectedOrder.vendorName && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-800 mb-1 flex items-center gap-1">
                      <Truck className="w-4 h-4" /> Assigned Vendor
                    </p>
                    <p className="text-sm font-semibold">{selectedOrder.vendorName}</p>
                    {selectedOrder.vendorEmail && (
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {selectedOrder.vendorEmail}
                      </p>
                    )}
                    {selectedOrder.vendorPhone && (
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {selectedOrder.vendorPhone}
                      </p>
                    )}
                  </div>
                )}

                {/* Update Status */}
                <div>
                  <Label>Update Status</Label>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {["open", "dispatched", "vendor_confirmed", "in_progress", "resolved", "cancelled"].map(s => (
                      <Button
                        key={s}
                        size="sm"
                        variant={selectedOrder.status === s ? "default" : "outline"}
                        className={selectedOrder.status === s ? "bg-[#1B4332] text-white" : ""}
                        onClick={() => {
                          updateMutation.mutate({ id: selectedOrder.id, status: s });
                          setSelectedOrder({ ...selectedOrder, status: s });
                        }}
                      >
                        {s.replace("_", " ")}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Find Vendor if none assigned */}
                {!selectedOrder.vendorName && (
                  <div className="border border-dashed border-gray-300 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <Search className="w-4 h-4 text-[#1B4332]" /> No vendor assigned — find one with AI
                    </p>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <Input placeholder="Trade (e.g. plumber)" value={findVendorData.trade} onChange={e => setFindVendorData(d => ({ ...d, trade: e.target.value }))} />
                      <Input placeholder="City" value={findVendorData.city} onChange={e => setFindVendorData(d => ({ ...d, city: e.target.value }))} />
                      <Input placeholder="State" value={findVendorData.state} onChange={e => setFindVendorData(d => ({ ...d, state: e.target.value }))} />
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white gap-1"
                      onClick={() => findVendorMutation.mutate({ workOrderId: selectedOrder.id, ...findVendorData })}
                      disabled={!findVendorData.trade || !findVendorData.city || findVendorMutation.isPending}
                    >
                      <Bot className="w-3 h-3" />
                      {findVendorMutation.isPending ? "Researching..." : "Draft AI Outreach Email"}
                    </Button>
                    {aiOutreach && (
                      <div className="mt-3 bg-gray-50 border rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-600 mb-1">AI-Drafted Outreach Email:</p>
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">{aiOutreach}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
