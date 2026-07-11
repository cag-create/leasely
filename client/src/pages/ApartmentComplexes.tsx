import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Building2, Plus, Home, ChevronRight, Trash2, Upload,
} from "lucide-react";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

function UnitStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    available: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    occupied: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    reserved: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    maintenance: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function AddUnitDialog({ complexId, onSuccess }: { complexId: number; onSuccess: () => void }) {
  
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    unitNumber: "", floor: "", monthlyRent: "", securityDeposit: "",
    bedrooms: "1", bathrooms: "1", squareFeet: "", availableDate: "",
    petFriendly: false, washerDryer: false, airConditioning: false,
    dishwasher: false, balcony: false,
    utilities: "not_included" as "included" | "not_included" | "partial",
    description: "", status: "available" as "available" | "occupied" | "reserved" | "maintenance",
  });

  const createUnit = trpc.complexes.createUnit.useMutation({
    onSuccess: () => {
      toast.success("Unit added successfully");
      utils.complexes.list.invalidate();
      setOpen(false);
      onSuccess();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUnit.mutate({
      complexId,
      unitNumber: form.unitNumber,
      floor: form.floor ? parseInt(form.floor) : undefined,
      monthlyRent: parseFloat(form.monthlyRent),
      securityDeposit: form.securityDeposit ? parseFloat(form.securityDeposit) : undefined,
      bedrooms: form.bedrooms,
      bathrooms: form.bathrooms,
      squareFeet: form.squareFeet ? parseInt(form.squareFeet) : undefined,
      availableDate: form.availableDate || undefined,
      petFriendly: form.petFriendly,
      washerDryer: form.washerDryer,
      airConditioning: form.airConditioning,
      dishwasher: form.dishwasher,
      balcony: form.balcony,
      utilities: form.utilities,
      description: form.description || undefined,
      status: form.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Unit</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Unit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Unit Number *</Label>
              <Input placeholder="e.g. 1A, 201" value={form.unitNumber} onChange={e => setForm(p => ({ ...p, unitNumber: e.target.value }))} required />
            </div>
            <div>
              <Label>Floor</Label>
              <Input type="number" placeholder="e.g. 2" value={form.floor} onChange={e => setForm(p => ({ ...p, floor: e.target.value }))} />
            </div>
            <div>
              <Label>Monthly Rent ($) *</Label>
              <Input type="number" placeholder="1500" value={form.monthlyRent} onChange={e => setForm(p => ({ ...p, monthlyRent: e.target.value }))} required />
            </div>
            <div>
              <Label>Security Deposit ($)</Label>
              <Input type="number" placeholder="1500" value={form.securityDeposit} onChange={e => setForm(p => ({ ...p, securityDeposit: e.target.value }))} />
            </div>
            <div>
              <Label>Bedrooms</Label>
              <Select value={form.bedrooms} onValueChange={v => setForm(p => ({ ...p, bedrooms: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Studio","1","2","3","4","5+"].map(b => <SelectItem key={b} value={b}>{b === "Studio" ? "Studio" : `${b} BR`}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Bathrooms</Label>
              <Select value={form.bathrooms} onValueChange={v => setForm(p => ({ ...p, bathrooms: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["1","1.5","2","2.5","3","3+"].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Square Feet</Label>
              <Input type="number" placeholder="850" value={form.squareFeet} onChange={e => setForm(p => ({ ...p, squareFeet: e.target.value }))} />
            </div>
            <div>
              <Label>Available Date</Label>
              <Input type="date" value={form.availableDate} onChange={e => setForm(p => ({ ...p, availableDate: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>Utilities</Label>
            <Select value={form.utilities} onValueChange={v => setForm(p => ({ ...p, utilities: v as any }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="included">Included</SelectItem>
                <SelectItem value="not_included">Not Included</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as any }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "petFriendly", label: "Pet Friendly" },
              { key: "washerDryer", label: "Washer/Dryer" },
              { key: "airConditioning", label: "A/C" },
              { key: "dishwasher", label: "Dishwasher" },
              { key: "balcony", label: "Balcony" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.checked }))} className="rounded" />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
          <div>
            <Label>Description</Label>
            <Textarea placeholder="Unit description..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} />
          </div>
          <Button type="submit" className="w-full" disabled={createUnit.isPending}>
            {createUnit.isPending ? "Adding..." : "Add Unit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ComplexCard({ complex, onSelect }: { complex: any; onSelect: (c: any) => void }) {
  
  const utils = trpc.useUtils();
  const deleteComplex = trpc.complexes.delete.useMutation({
    onSuccess: () => { toast.success("Complex deleted"); utils.complexes.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => onSelect(complex)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{complex.name}</h3>
              <p className="text-sm text-muted-foreground truncate">{complex.address}, {complex.city}, {complex.state}</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0" onClick={e => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onSelect(complex)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => { if (confirm("Delete this complex and all its units?")) deleteComplex.mutate({ id: complex.id }); }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className="text-lg font-bold">{complex.totalUnits}</p>
            <p className="text-xs text-muted-foreground">Total Units</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-emerald-500/10">
            <p className="text-lg font-bold text-emerald-400">{complex.availableUnits}</p>
            <p className="text-xs text-muted-foreground">Available</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-blue-500/10">
            <p className="text-lg font-bold text-blue-400">{complex.occupiedUnits}</p>
            <p className="text-xs text-muted-foreground">Occupied</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {complex.hasPool ? <Badge variant="secondary" className="text-xs">Pool</Badge> : null}
          {complex.hasGym ? <Badge variant="secondary" className="text-xs">Gym</Badge> : null}
          {complex.hasElevator ? <Badge variant="secondary" className="text-xs">Elevator</Badge> : null}
          {complex.hasParking ? <Badge variant="secondary" className="text-xs">Parking</Badge> : null}
          {complex.hasLaundry ? <Badge variant="secondary" className="text-xs">Laundry</Badge> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function CreateComplexDialog({ onSuccess }: { onSuccess: () => void }) {
  
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", address: "", city: "", state: "", zip: "",
    neighborhood: "", totalUnits: "1", yearBuilt: "", stories: "",
    hasPool: false, hasGym: false, hasElevator: false, hasDoorman: false,
    hasParking: false, hasLaundry: false,
    petPolicy: "case_by_case" as "allowed" | "not_allowed" | "case_by_case",
    contactName: "", contactEmail: "", contactPhone: "", website: "",
  });

  const createComplex = trpc.complexes.create.useMutation({
    onSuccess: () => {
      toast.success("Complex created!");
      utils.complexes.list.invalidate();
      setOpen(false);
      onSuccess();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createComplex.mutate({
      name: form.name,
      description: form.description || undefined,
      address: form.address,
      city: form.city,
      state: form.state,
      zip: form.zip,
      neighborhood: form.neighborhood || undefined,
      totalUnits: parseInt(form.totalUnits) || 1,
      yearBuilt: form.yearBuilt ? parseInt(form.yearBuilt) : undefined,
      stories: form.stories ? parseInt(form.stories) : undefined,
      hasPool: form.hasPool,
      hasGym: form.hasGym,
      hasElevator: form.hasElevator,
      hasDoorman: form.hasDoorman,
      hasParking: form.hasParking,
      hasLaundry: form.hasLaundry,
      petPolicy: form.petPolicy,
      contactName: form.contactName || undefined,
      contactEmail: form.contactEmail || undefined,
      contactPhone: form.contactPhone || undefined,
      website: form.website || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Add Complex</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Apartment Complex</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label>Complex Name *</Label>
            <Input placeholder="e.g. Sunset Apartments" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea placeholder="Describe the complex..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} />
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label>Street Address *</Label>
              <Input placeholder="123 Main St" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <Label>City *</Label>
                <Input placeholder="Atlanta" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} required />
              </div>
              <div>
                <Label>State *</Label>
                <Select value={form.state} onValueChange={v => setForm(p => ({ ...p, state: v }))}>
                  <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
                  <SelectContent>{US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>ZIP *</Label>
                <Input placeholder="30301" value={form.zip} onChange={e => setForm(p => ({ ...p, zip: e.target.value }))} required />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Total Units</Label>
              <Input type="number" min="1" value={form.totalUnits} onChange={e => setForm(p => ({ ...p, totalUnits: e.target.value }))} />
            </div>
            <div>
              <Label>Year Built</Label>
              <Input type="number" placeholder="2005" value={form.yearBuilt} onChange={e => setForm(p => ({ ...p, yearBuilt: e.target.value }))} />
            </div>
            <div>
              <Label>Stories</Label>
              <Input type="number" placeholder="4" value={form.stories} onChange={e => setForm(p => ({ ...p, stories: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label className="mb-2 block">Amenities</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "hasPool", label: "Pool" },
                { key: "hasGym", label: "Gym" },
                { key: "hasElevator", label: "Elevator" },
                { key: "hasDoorman", label: "Doorman" },
                { key: "hasParking", label: "Parking" },
                { key: "hasLaundry", label: "Laundry" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border hover:bg-muted/50">
                  <input type="checkbox" checked={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.checked }))} />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label>Pet Policy</Label>
            <Select value={form.petPolicy} onValueChange={v => setForm(p => ({ ...p, petPolicy: v as any }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="allowed">Pets Allowed</SelectItem>
                <SelectItem value="not_allowed">No Pets</SelectItem>
                <SelectItem value="case_by_case">Case by Case</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Contact Name</Label>
              <Input placeholder="Property Manager" value={form.contactName} onChange={e => setForm(p => ({ ...p, contactName: e.target.value }))} />
            </div>
            <div>
              <Label>Contact Phone</Label>
              <Input placeholder="(404) 555-0100" value={form.contactPhone} onChange={e => setForm(p => ({ ...p, contactPhone: e.target.value }))} />
            </div>
            <div>
              <Label>Contact Email</Label>
              <Input type="email" placeholder="manager@example.com" value={form.contactEmail} onChange={e => setForm(p => ({ ...p, contactEmail: e.target.value }))} />
            </div>
            <div>
              <Label>Website</Label>
              <Input placeholder="https://..." value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={createComplex.isPending}>
            {createComplex.isPending ? "Creating..." : "Create Complex"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ComplexDetail({ complex, onBack }: { complex: any; onBack: () => void }) {
  
  const utils = trpc.useUtils();
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: units = [], isLoading } = trpc.complexes.listUnits.useQuery({ complexId: complex.id });

  const updateUnit = trpc.complexes.updateUnit.useMutation({
    onSuccess: () => { toast.success("Unit updated"); utils.complexes.listUnits.invalidate(); utils.complexes.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const deleteUnit = trpc.complexes.deleteUnit.useMutation({
    onSuccess: () => { toast.success("Unit deleted"); utils.complexes.listUnits.invalidate(); utils.complexes.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const publishUnit = trpc.complexes.publishUnit.useMutation({
    onSuccess: () => toast.success("Unit published to marketplace!"),
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          ← Back
        </Button>
        <div>
          <h2 className="text-xl font-bold">{complex.name}</h2>
          <p className="text-sm text-muted-foreground">{complex.address}, {complex.city}, {complex.state} {complex.zip}</p>
        </div>
        <div className="ml-auto">
          <AddUnitDialog complexId={complex.id} onSuccess={() => setRefreshKey(k => k + 1)} />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading units...</div>
      ) : units.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
          <Home className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground mb-4">No units added yet</p>
          <AddUnitDialog complexId={complex.id} onSuccess={() => setRefreshKey(k => k + 1)} />
        </div>
      ) : (
        <div className="space-y-3">
          {units.map((unit: any) => (
            <Card key={unit.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Home className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">Unit {unit.unitNumber}</span>
                        <UnitStatusBadge status={unit.status} />
                        {unit.marketplaceListingId && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                            Listed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {unit.bedrooms} BR · {unit.bathrooms} BA
                        {unit.squareFeet ? ` · ${unit.squareFeet} sqft` : ""}
                        {unit.floor ? ` · Floor ${unit.floor}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-primary">${unit.monthlyRent?.toLocaleString()}/mo</span>
                    <div className="flex gap-1">
                      <Select value={unit.status} onValueChange={v => updateUnit.mutate({ id: unit.id, status: v as any })}>
                        <SelectTrigger className="h-8 w-32 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="occupied">Occupied</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" className="h-8 gap-1 text-xs"
                        onClick={() => publishUnit.mutate({ unitId: unit.id })}
                        disabled={publishUnit.isPending}>
                        <Upload className="h-3 w-3" />
                        {unit.marketplaceListingId ? "Update" : "Publish"}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => { if (confirm("Delete this unit?")) deleteUnit.mutate({ id: unit.id }); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ApartmentComplexes() {
  const { user } = useAuth();
  const [selectedComplex, setSelectedComplex] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: complexes = [], isLoading } = trpc.complexes.list.useQuery();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please sign in to manage your complexes.</p>
      </div>
    );
  }

  if (selectedComplex) {
    return <ComplexDetail complex={selectedComplex} onBack={() => setSelectedComplex(null)} />;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Apartment Complexes
          </h1>
          <p className="text-muted-foreground mt-1">Manage your multi-unit properties and individual units</p>
        </div>
        <CreateComplexDialog onSuccess={() => setRefreshKey(k => k + 1)} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2].map(i => <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : complexes.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-2xl">
          <Building2 className="h-14 w-14 mx-auto mb-4 text-muted-foreground/40" />
          <h3 className="text-lg font-semibold mb-2">No complexes yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Add your first apartment complex to start managing units and publishing listings.
          </p>
          <CreateComplexDialog onSuccess={() => setRefreshKey(k => k + 1)} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complexes.map((c: any) => (
            <ComplexCard key={c.id} complex={c} onSelect={setSelectedComplex} />
          ))}
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
