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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import {
  Building2, Users, FileText, Plus, Pencil, Trash2,
  Phone, Mail, MapPin, Calendar, DollarSign, AlertCircle,
  ChevronRight, StickyNote, Home, CheckCircle2, Wrench, Receipt
} from "lucide-react";

function getDaysUntilExpiry(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function CRM() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
  const [addPropertyOpen, setAddPropertyOpen] = useState(false);
  const [addTenantOpen, setAddTenantOpen] = useState(false);
  const [addLeaseOpen, setAddLeaseOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteEntityType, setNoteEntityType] = useState<"property" | "tenant">("property");

  const [propertyForm, setPropertyForm] = useState({
    address: "", city: "", state: "", zip: "",
    propertyType: "single_family", totalUnits: 1,
    purchasePrice: "", currentValue: "", yearBuilt: "", squareFeet: "", notes: "",
  });

  const [tenantForm, setTenantForm] = useState({
    crmPropertyId: 0,
    firstName: "", lastName: "", email: "", phone: "",
    moveInDate: "", monthlyRent: "", securityDeposit: "", notes: "",
  });

  const [leaseForm, setLeaseForm] = useState({
    crmPropertyId: 0, crmTenantId: 0,
    startDate: "", endDate: "", monthlyRent: "", securityDeposit: "",
    leaseType: "fixed_term" as "fixed_term" | "month_to_month" | "week_to_week",
    notes: "",
  });

  const { data: properties, refetch: refetchProperties } = trpc.crm.listProperties.useQuery(undefined, {
    enabled: isAuthenticated, retry: false,
  });

  const { data: tenants, refetch: refetchTenants } = trpc.crm.listTenants.useQuery(
    { propertyId: selectedPropertyId ?? undefined },
    { enabled: isAuthenticated, retry: false }
  );

  const { data: leases, refetch: refetchLeases } = trpc.crm.listLeases.useQuery(
    { propertyId: selectedPropertyId ?? undefined },
    { enabled: isAuthenticated, retry: false }
  );

  const { data: propertyNotes, refetch: refetchPropNotes } = trpc.crm.listNotes.useQuery(
    { entityType: "property", entityId: selectedPropertyId ?? 0 },
    { enabled: isAuthenticated && !!selectedPropertyId, retry: false }
  );

  const { data: tenantNotes, refetch: refetchTenantNotes } = trpc.crm.listNotes.useQuery(
    { entityType: "tenant", entityId: selectedTenantId ?? 0 },
    { enabled: isAuthenticated && !!selectedTenantId, retry: false }
  );

  const selectedPropertyListingId = properties?.find(p => p.id === selectedPropertyId)?.listingId ?? null;

  const { data: workOrdersForProperty } = trpc.crm.listWorkOrders.useQuery(
    { crmPropertyId: selectedPropertyId ?? undefined, listingId: selectedPropertyListingId ?? undefined },
    { enabled: isAuthenticated && !!selectedPropertyId, retry: false }
  );

  const { data: rentPaymentsForProperty } = trpc.crm.listRentPayments.useQuery(
    { listingId: selectedPropertyListingId ?? 0 },
    { enabled: isAuthenticated && !!selectedPropertyListingId, retry: false }
  );

  const createPropertyMutation = trpc.crm.createProperty.useMutation({
    onSuccess: () => { toast.success("Property added"); setAddPropertyOpen(false); refetchProperties(); },
    onError: (e) => toast.error(e.message),
  });

  const deletePropertyMutation = trpc.crm.deleteProperty.useMutation({
    onSuccess: () => { toast.success("Property removed"); setSelectedPropertyId(null); refetchProperties(); },
    onError: (e) => toast.error(e.message),
  });

  const createTenantMutation = trpc.crm.createTenant.useMutation({
    onSuccess: () => { toast.success("Tenant added"); setAddTenantOpen(false); refetchTenants(); },
    onError: (e) => toast.error(e.message),
  });

  const deleteTenantMutation = trpc.crm.deleteTenant.useMutation({
    onSuccess: () => { toast.success("Tenant removed"); setSelectedTenantId(null); refetchTenants(); },
    onError: (e) => toast.error(e.message),
  });

  const createLeaseMutation = trpc.crm.createLease.useMutation({
    onSuccess: () => { toast.success("Lease added"); setAddLeaseOpen(false); refetchLeases(); },
    onError: (e) => toast.error(e.message),
  });

  const createNoteMutation = trpc.crm.createNote.useMutation({
    onSuccess: () => {
      toast.success("Note added");
      setNoteContent("");
      if (noteEntityType === "property") refetchPropNotes();
      else refetchTenantNotes();
    },
    onError: (e) => toast.error(e.message),
  });

  const fmt = (cents: number) => `$${(cents / 100).toLocaleString("en-US")}`;

  const selectedProperty = properties?.find(p => p.id === selectedPropertyId);
  const selectedTenant = tenants?.find(t => t.id === selectedTenantId);

  // Lease expiry alerts (within 30 days)
  const expiringLeases = leases?.filter(l => {
    if (l.status !== "active") return false;
    const days = getDaysUntilExpiry(l.endDate);
    return days >= 0 && days <= 30;
  }) ?? [];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Sign in required</h2>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </div>
        </div>
      </div>
    );
  }

  const activeLeases = leases?.filter(l => l.status === "active").length ?? 0;
  const totalUnits = properties?.reduce((sum, p) => sum + (p.totalUnits ?? 1), 0) ?? 0;
  const occupancyRate = totalUnits > 0 ? Math.round((activeLeases / totalUnits) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="w-8 h-8 text-[#1B4332]" />
              Property CRM
            </h1>
            <p className="text-gray-500 mt-1">Your full portfolio — properties, tenants, leases, and notes</p>
          </div>
        </div>

        {/* Expiry Alerts */}
        {expiringLeases.length > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-amber-800">Lease Renewal Alerts</span>
            </div>
            {expiringLeases.map(l => (
              <p key={l.id} className="text-sm text-amber-700">
                Lease ending in <strong>{getDaysUntilExpiry(l.endDate)} days</strong> — {l.endDate}
              </p>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <Building2 className="w-7 h-7 text-[#1B4332]" />
              <div>
                <div className="text-2xl font-bold">{properties?.length ?? 0}</div>
                <div className="text-xs text-gray-500">Properties</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <Home className="w-7 h-7 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{totalUnits}</div>
                <div className="text-xs text-gray-500">Total Units</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <Users className="w-7 h-7 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{tenants?.length ?? 0}</div>
                <div className="text-xs text-gray-500">Tenants</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{occupancyRate}%</div>
                <div className="text-xs text-gray-500">Occupancy</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Properties List */}
          <div className="col-span-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">Properties</h2>
              <Dialog open={addPropertyOpen} onOpenChange={setAddPropertyOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Add Property</DialogTitle></DialogHeader>
                  <div className="space-y-3 mt-2">
                    <div>
                      <Label>Street Address *</Label>
                      <Input value={propertyForm.address} onChange={e => setPropertyForm(f => ({ ...f, address: e.target.value }))} placeholder="123 Main St" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label>City</Label>
                        <Input value={propertyForm.city} onChange={e => setPropertyForm(f => ({ ...f, city: e.target.value }))} placeholder="Charlotte" />
                      </div>
                      <div>
                        <Label>State</Label>
                        <Input value={propertyForm.state} onChange={e => setPropertyForm(f => ({ ...f, state: e.target.value }))} placeholder="NC" />
                      </div>
                      <div>
                        <Label>ZIP</Label>
                        <Input value={propertyForm.zip} onChange={e => setPropertyForm(f => ({ ...f, zip: e.target.value }))} placeholder="28201" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Property Type</Label>
                        <Select value={propertyForm.propertyType} onValueChange={v => setPropertyForm(f => ({ ...f, propertyType: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single_family">Single Family</SelectItem>
                            <SelectItem value="multi_family">Multi-Family</SelectItem>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="condo">Condo</SelectItem>
                            <SelectItem value="townhouse">Townhouse</SelectItem>
                            <SelectItem value="commercial">Commercial</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Total Units</Label>
                        <Input type="number" min="1" value={propertyForm.totalUnits} onChange={e => setPropertyForm(f => ({ ...f, totalUnits: parseInt(e.target.value) || 1 }))} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Purchase Price ($)</Label>
                        <Input type="number" value={propertyForm.purchasePrice} onChange={e => setPropertyForm(f => ({ ...f, purchasePrice: e.target.value }))} placeholder="250000" />
                      </div>
                      <div>
                        <Label>Current Value ($)</Label>
                        <Input type="number" value={propertyForm.currentValue} onChange={e => setPropertyForm(f => ({ ...f, currentValue: e.target.value }))} placeholder="320000" />
                      </div>
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Textarea value={propertyForm.notes} onChange={e => setPropertyForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
                    </div>
                    <Button
                      className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white"
                      onClick={() => createPropertyMutation.mutate({
                        ...propertyForm,
                        purchasePrice: propertyForm.purchasePrice ? Math.round(parseFloat(propertyForm.purchasePrice) * 100) : undefined,
                        currentValue: propertyForm.currentValue ? Math.round(parseFloat(propertyForm.currentValue) * 100) : undefined,
                        yearBuilt: propertyForm.yearBuilt ? parseInt(propertyForm.yearBuilt) : undefined,
                        squareFeet: propertyForm.squareFeet ? parseInt(propertyForm.squareFeet) : undefined,
                      })}
                      disabled={!propertyForm.address || createPropertyMutation.isPending}
                    >
                      {createPropertyMutation.isPending ? "Adding..." : "Add Property"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {!properties || properties.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No properties yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {properties.map(p => (
                  <Card
                    key={p.id}
                    className={`cursor-pointer hover:shadow-md transition-all ${selectedPropertyId === p.id ? "ring-2 ring-[#1B4332]" : ""}`}
                    onClick={() => { setSelectedPropertyId(p.id); setSelectedTenantId(null); }}
                  >
                    <CardContent className="py-3 px-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{p.address}</p>
                          <p className="text-xs text-gray-500">{p.city}, {p.state} · {p.totalUnits ?? 1} unit{(p.totalUnits ?? 1) > 1 ? "s" : ""}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full mt-1 inline-block ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                            {p.status}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="col-span-8">
            {!selectedProperty ? (
              <Card className="h-full flex items-center justify-center py-24">
                <CardContent className="text-center">
                  <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400">Select a property to view details</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Property Header */}
                <Card>
                  <CardContent className="py-4 px-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedProperty.address}</h2>
                        <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zip}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="capitalize">{selectedProperty.propertyType?.replace("_", " ")}</Badge>
                          <Badge variant="outline">{selectedProperty.totalUnits ?? 1} unit{(selectedProperty.totalUnits ?? 1) > 1 ? "s" : ""}</Badge>
                          {selectedProperty.currentValue && (
                            <Badge variant="outline" className="text-green-700">{fmt(selectedProperty.currentValue)}</Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-600"
                        onClick={() => deletePropertyMutation.mutate({ id: selectedProperty.id })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {selectedProperty.notes && (
                      <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded p-2">{selectedProperty.notes}</p>
                    )}
                  </CardContent>
                </Card>

                <Tabs defaultValue="tenants">
                  <TabsList className="flex-wrap h-auto">
                    <TabsTrigger value="tenants">Tenants ({tenants?.length ?? 0})</TabsTrigger>
                    <TabsTrigger value="leases">Leases ({leases?.length ?? 0})</TabsTrigger>
                    <TabsTrigger value="maintenance">Maintenance ({workOrdersForProperty?.length ?? 0})</TabsTrigger>
                    <TabsTrigger value="accounting">Accounting ({rentPaymentsForProperty?.length ?? 0})</TabsTrigger>
                    <TabsTrigger value="notes">Notes ({propertyNotes?.length ?? 0})</TabsTrigger>
                  </TabsList>

                  {/* Tenants Tab */}
                  <TabsContent value="tenants">
                    <div className="flex justify-end mb-3">
                      <Dialog open={addTenantOpen} onOpenChange={setAddTenantOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white gap-1">
                            <Plus className="w-3.5 h-3.5" /> Add Tenant
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader><DialogTitle>Add Tenant</DialogTitle></DialogHeader>
                          <div className="space-y-3 mt-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label>First Name *</Label>
                                <Input value={tenantForm.firstName} onChange={e => setTenantForm(f => ({ ...f, firstName: e.target.value }))} />
                              </div>
                              <div>
                                <Label>Last Name *</Label>
                                <Input value={tenantForm.lastName} onChange={e => setTenantForm(f => ({ ...f, lastName: e.target.value }))} />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label>Email</Label>
                                <Input type="email" value={tenantForm.email} onChange={e => setTenantForm(f => ({ ...f, email: e.target.value }))} />
                              </div>
                              <div>
                                <Label>Phone</Label>
                                <Input value={tenantForm.phone} onChange={e => setTenantForm(f => ({ ...f, phone: e.target.value }))} />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label>Move-in Date</Label>
                                <Input type="date" value={tenantForm.moveInDate} onChange={e => setTenantForm(f => ({ ...f, moveInDate: e.target.value }))} />
                              </div>
                              <div>
                                <Label>Monthly Rent ($)</Label>
                                <Input type="number" value={tenantForm.monthlyRent} onChange={e => setTenantForm(f => ({ ...f, monthlyRent: e.target.value }))} />
                              </div>
                            </div>
                            <div>
                              <Label>Notes</Label>
                              <Textarea value={tenantForm.notes} onChange={e => setTenantForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
                            </div>
                            <Button
                              className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white"
                              onClick={() => createTenantMutation.mutate({
                                ...tenantForm,
                                crmPropertyId: selectedProperty.id,
                                monthlyRent: tenantForm.monthlyRent ? Math.round(parseFloat(tenantForm.monthlyRent) * 100) : undefined,
                                securityDeposit: tenantForm.securityDeposit ? Math.round(parseFloat(tenantForm.securityDeposit) * 100) : undefined,
                              })}
                              disabled={!tenantForm.firstName || !tenantForm.lastName || createTenantMutation.isPending}
                            >
                              {createTenantMutation.isPending ? "Adding..." : "Add Tenant"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    {!tenants || tenants.length === 0 ? (
                      <Card className="text-center py-8">
                        <CardContent>
                          <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No tenants yet</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-2">
                        {tenants.map(t => (
                          <Card key={t.id} className={`cursor-pointer hover:shadow-sm transition-all ${selectedTenantId === t.id ? "ring-2 ring-[#1B4332]" : ""}`}
                            onClick={() => setSelectedTenantId(t.id)}>
                            <CardContent className="py-3 px-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">{t.firstName} {t.lastName}</p>
                                  <div className="flex gap-3 mt-0.5">
                                    {t.email && <p className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" />{t.email}</p>}
                                    {t.phone && <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{t.phone}</p>}
                                  </div>
                                  {t.monthlyRent && <p className="text-xs text-green-700 mt-0.5">${(t.monthlyRent / 100).toLocaleString()}/mo</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                                    {t.status}
                                  </span>
                                  <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600 h-7 w-7 p-0"
                                    onClick={e => { e.stopPropagation(); deleteTenantMutation.mutate({ id: t.id }); }}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                    {/* Tenant Notes */}
                    {selectedTenantId && (
                      <div className="mt-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                          <StickyNote className="w-4 h-4" /> Tenant Notes
                        </h3>
                        <div className="space-y-2 mb-3">
                          {(tenantNotes ?? []).map(n => (
                            <div key={n.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <p className="text-sm text-gray-700">{n.content}</p>
                              <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a note about this tenant..."
                            value={noteEntityType === "tenant" ? noteContent : ""}
                            onChange={e => { setNoteEntityType("tenant"); setNoteContent(e.target.value); }}
                          />
                          <Button
                            size="sm"
                            className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white"
                            onClick={() => { setNoteEntityType("tenant"); createNoteMutation.mutate({ entityType: "tenant", entityId: selectedTenantId, content: noteContent }); }}
                            disabled={!noteContent || createNoteMutation.isPending}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Leases Tab */}
                  <TabsContent value="leases">
                    <div className="flex justify-end mb-3">
                      <Dialog open={addLeaseOpen} onOpenChange={setAddLeaseOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white gap-1">
                            <Plus className="w-3.5 h-3.5" /> Add Lease
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader><DialogTitle>Add Lease</DialogTitle></DialogHeader>
                          <div className="space-y-3 mt-2">
                            <div>
                              <Label>Tenant *</Label>
                              <Select value={leaseForm.crmTenantId.toString()} onValueChange={v => setLeaseForm(f => ({ ...f, crmTenantId: parseInt(v) }))}>
                                <SelectTrigger><SelectValue placeholder="Select tenant" /></SelectTrigger>
                                <SelectContent>
                                  {(tenants ?? []).map(t => (
                                    <SelectItem key={t.id} value={t.id.toString()}>{t.firstName} {t.lastName}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label>Start Date *</Label>
                                <Input type="date" value={leaseForm.startDate} onChange={e => setLeaseForm(f => ({ ...f, startDate: e.target.value }))} />
                              </div>
                              <div>
                                <Label>End Date *</Label>
                                <Input type="date" value={leaseForm.endDate} onChange={e => setLeaseForm(f => ({ ...f, endDate: e.target.value }))} />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label>Monthly Rent ($) *</Label>
                                <Input type="number" value={leaseForm.monthlyRent} onChange={e => setLeaseForm(f => ({ ...f, monthlyRent: e.target.value }))} />
                              </div>
                              <div>
                                <Label>Security Deposit ($)</Label>
                                <Input type="number" value={leaseForm.securityDeposit} onChange={e => setLeaseForm(f => ({ ...f, securityDeposit: e.target.value }))} />
                              </div>
                            </div>
                            <div>
                              <Label>Lease Type</Label>
                              <Select value={leaseForm.leaseType} onValueChange={v => setLeaseForm(f => ({ ...f, leaseType: v as any }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="fixed_term">Fixed Term</SelectItem>
                                  <SelectItem value="month_to_month">Month to Month</SelectItem>
                                  <SelectItem value="week_to_week">Week to Week</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white"
                              onClick={() => createLeaseMutation.mutate({
                                ...leaseForm,
                                crmPropertyId: selectedProperty.id,
                                monthlyRent: Math.round(parseFloat(leaseForm.monthlyRent) * 100),
                                securityDeposit: leaseForm.securityDeposit ? Math.round(parseFloat(leaseForm.securityDeposit) * 100) : undefined,
                              })}
                              disabled={!leaseForm.crmTenantId || !leaseForm.startDate || !leaseForm.endDate || !leaseForm.monthlyRent || createLeaseMutation.isPending}
                            >
                              {createLeaseMutation.isPending ? "Adding..." : "Add Lease"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    {!leases || leases.length === 0 ? (
                      <Card className="text-center py-8">
                        <CardContent>
                          <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No leases yet</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-2">
                        {leases.map(l => {
                          const daysLeft = getDaysUntilExpiry(l.endDate);
                          return (
                            <Card key={l.id}>
                              <CardContent className="py-3 px-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${l.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                                        {l.status}
                                      </span>
                                      <span className="text-xs text-gray-500 capitalize">{l.leaseType?.replace("_", " ")}</span>
                                    </div>
                                    <p className="text-sm font-medium mt-1">
                                      {l.startDate} → {l.endDate}
                                      {daysLeft >= 0 && daysLeft <= 30 && (
                                        <span className="ml-2 text-xs text-amber-600 font-semibold">⚠ {daysLeft}d left</span>
                                      )}
                                    </p>
                                    <p className="text-sm text-green-700">${(l.monthlyRent / 100).toLocaleString()}/mo</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>

                  {/* Maintenance Tab */}
                  <TabsContent value="maintenance">
                    {!workOrdersForProperty || workOrdersForProperty.length === 0 ? (
                      <Card className="text-center py-8">
                        <CardContent>
                          <Wrench className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No maintenance requests for this property</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-2">
                        {workOrdersForProperty.map(wo => (
                          <Card key={wo.id}>
                            <CardContent className="py-3 px-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                      wo.status === "resolved" || wo.status === "cancelled" ? "bg-gray-100 text-gray-600"
                                      : wo.status === "open" ? "bg-red-100 text-red-700"
                                      : "bg-blue-100 text-blue-700"
                                    }`}>{wo.status?.replace("_", " ")}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                      wo.priority === "emergency" ? "bg-red-100 text-red-700"
                                      : wo.priority === "high" ? "bg-orange-100 text-orange-700"
                                      : "bg-gray-100 text-gray-600"
                                    }`}>{wo.priority}</span>
                                    <span className="text-xs text-gray-400 capitalize">{wo.category?.replace("_", " ")}</span>
                                  </div>
                                  <p className="text-sm font-medium text-gray-900">{wo.title}</p>
                                  {wo.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{wo.description}</p>}
                                  {wo.tenantName && <p className="text-xs text-gray-400 mt-1">Submitted by: {wo.tenantName}</p>}
                                  {wo.vendorName && <p className="text-xs text-blue-600 mt-0.5">Vendor: {wo.vendorName}</p>}
                                </div>
                                <div className="text-xs text-gray-400 shrink-0 ml-3">
                                  {new Date(wo.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Accounting Tab */}
                  <TabsContent value="accounting">
                    {!selectedPropertyListingId ? (
                      <Card className="text-center py-8">
                        <CardContent>
                          <Receipt className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No listing linked to this property</p>
                        </CardContent>
                      </Card>
                    ) : !rentPaymentsForProperty || rentPaymentsForProperty.length === 0 ? (
                      <Card className="text-center py-8">
                        <CardContent>
                          <Receipt className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No rent payments recorded yet</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 px-1 mb-1">
                          <span>Period</span>
                          <span>Amount · Status</span>
                        </div>
                        {rentPaymentsForProperty.map(p => (
                          <Card key={p.id}>
                            <CardContent className="py-3 px-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{p.periodMonth}</p>
                                  <p className="text-xs text-gray-500">Due: {p.dueDate}{p.paymentMethod ? ` · ${p.paymentMethod}` : ""}</p>
                                  {p.tenantEmail && <p className="text-xs text-gray-400">{p.tenantEmail}</p>}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-gray-900">${(p.amountCents / 100).toLocaleString()}</p>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    p.status === "paid" ? "bg-green-100 text-green-700"
                                    : p.status === "late" ? "bg-red-100 text-red-700"
                                    : p.status === "pending" ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-600"
                                  }`}>{p.status}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm font-semibold text-green-800">
                            Total collected: ${((rentPaymentsForProperty.filter(p => p.status === "paid").reduce((s, p) => s + (p.paidAmountCents ?? p.amountCents), 0)) / 100).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Notes Tab */}
                  <TabsContent value="notes">
                    <div className="space-y-2 mb-4">
                      {(propertyNotes ?? []).map(n => (
                        <div key={n.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-sm text-gray-700">{n.content}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                      {(!propertyNotes || propertyNotes.length === 0) && (
                        <p className="text-sm text-gray-400 text-center py-4">No notes yet</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a note about this property..."
                        value={noteEntityType === "property" ? noteContent : ""}
                        onChange={e => { setNoteEntityType("property"); setNoteContent(e.target.value); }}
                      />
                      <Button
                        size="sm"
                        className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white"
                        onClick={() => { setNoteEntityType("property"); createNoteMutation.mutate({ entityType: "property", entityId: selectedProperty.id, content: noteContent }); }}
                        disabled={!noteContent || createNoteMutation.isPending}
                      >
                        Add Note
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
