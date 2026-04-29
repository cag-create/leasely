import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { loadMapScript } from "@/components/Map";
import { toast } from "sonner";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  MapPin, Upload, ChevronRight, ChevronLeft, CheckCircle2,
  Building2, DollarSign, Image, User, Loader2, X, ArrowLeft
} from "lucide-react";
import { PROPERTY_TYPES, BEDROOM_OPTIONS, US_STATES } from "@/lib/marketplace";

type FormData = {
  title: string; propertyType: string; address: string; city: string;
  state: string; zip: string; neighborhood: string; monthlyRent: number;
  securityDeposit: number; bedrooms: string; bathrooms: string;
  squareFeet: number; availableDate: string; petFriendly: boolean;
  isCoLiving: boolean; parkingAvailable: boolean; washerDryer: boolean;
  airConditioning: boolean; dishwasher: boolean; utilities: string;
  description: string; contactName: string; contactEmail: string; contactPhone: string;
};

const STEPS = [
  { id: 1, title: "Property Details", icon: Building2 },
  { id: 2, title: "Location", icon: MapPin },
  { id: 3, title: "Pricing & Specs", icon: DollarSign },
  { id: 4, title: "Photos & Description", icon: Image },
  { id: 5, title: "Contact Info", icon: User },
];

export default function EditListing() {
  const params = useParams<{ id: string }>();
  const listingId = parseInt(params.id ?? "0");
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<string[]>([]);
  const [geocoding, setGeocoding] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: listing, isLoading } = trpc.marketplace.getListingById.useQuery(
    { id: listingId },
    { enabled: !!listingId }
  );

  const { register, handleSubmit, setValue, watch, reset } = useForm<FormData>();
  const watchedValues = watch();
  const utils = trpc.useUtils();

  // Prefill form when listing loads
  useEffect(() => {
    if (!listing) return;
    reset({
      title: listing.title ?? "",
      propertyType: listing.propertyType ?? "apartment",
      address: (listing as any).address ?? "",
      city: listing.city ?? "",
      state: listing.state ?? "",
      zip: (listing as any).zip ?? "",
      neighborhood: (listing as any).neighborhood ?? "",
      monthlyRent: listing.monthlyRent ?? 0,
      securityDeposit: (listing as any).securityDeposit ?? 0,
      bedrooms: listing.bedrooms ?? "1",
      bathrooms: listing.bathrooms ?? "1",
      squareFeet: (listing as any).squareFeet ?? 0,
      availableDate: (listing as any).availableDate ?? "",
      petFriendly: !!(listing as any).petFriendly,
      isCoLiving: !!(listing as any).isCoLiving,
      parkingAvailable: !!(listing as any).parkingAvailable,
      washerDryer: !!(listing as any).washerDryer,
      airConditioning: !!(listing as any).airConditioning,
      dishwasher: !!(listing as any).dishwasher,
      utilities: (listing as any).utilities ?? "not_included",
      description: (listing as any).description ?? "",
      contactName: (listing as any).contactName ?? "",
      contactEmail: (listing as any).contactEmail ?? "",
      contactPhone: (listing as any).contactPhone ?? "",
    });
    // Load existing photos
    try {
      const existingPhotos = listing.photos ? JSON.parse(listing.photos as string) : [];
      setPhotos(Array.isArray(existingPhotos) ? existingPhotos : []);
    } catch { setPhotos([]); }
  }, [listing, reset]);

  const updateMutation = trpc.marketplace.updateListing.useMutation({
    onSuccess: () => {
      utils.marketplace.getMyListings.invalidate();
      toast.success("Listing updated!");
      navigate("/dashboard");
    },
    onError: (e) => toast.error(e.message || "Update failed"),
  });

  const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setUploading(true);
    for (const file of files) {
      const reader = new FileReader();
      await new Promise<void>((resolve) => {
        reader.onload = async (ev) => {
          try {
            const res = await fetch("/api/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ dataUrl: ev.target!.result, filename: file.name }),
            });
            const data = await res.json();
            if (data.url) setPhotos(prev => [...prev, data.url]);
            else toast.error("Photo upload failed");
          } catch { toast.error("Photo upload failed"); }
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
    setUploading(false);
    e.target.value = "";
  }, []);

  const geocodeAddress = useCallback(async () => {
    const addr = `${watchedValues.address}, ${watchedValues.city}, ${watchedValues.state} ${watchedValues.zip}`;
    if (!watchedValues.address || !watchedValues.city) { toast.error("Fill in address and city first"); return; }
    setGeocoding(true);
    try {
      await loadMapScript();
      if (!window.google?.maps) { toast.error("Map service unavailable"); setGeocoding(false); return; }
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: addr }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          toast.success("Address verified on map!");
        } else {
          toast.error("Could not verify address — listing will still save.");
        }
        setGeocoding(false);
      });
    } catch { setGeocoding(false); }
  }, [watchedValues]);

  const onSubmit = (data: FormData) => {
    updateMutation.mutate({
      id: listingId,
      title: data.title,
      description: data.description,
      propertyType: data.propertyType,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      neighborhood: data.neighborhood,
      monthlyRent: Number(data.monthlyRent),
      securityDeposit: data.securityDeposit ? Number(data.securityDeposit) : undefined,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      squareFeet: data.squareFeet ? Number(data.squareFeet) : undefined,
      availableDate: data.availableDate,
      petFriendly: data.petFriendly,
      isCoLiving: data.isCoLiving,
      parkingAvailable: data.parkingAvailable,
      washerDryer: data.washerDryer,
      airConditioning: data.airConditioning,
      dishwasher: data.dishwasher,
      utilities: data.utilities as any,
      photos,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
    });
  };

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Listing not found.</p>
      </div>
    );
  }

  const currentStep = STEPS[step - 1];
  const StepIcon = currentStep.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back */}
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold text-foreground mb-1">Edit Listing</h1>
        <p className="text-muted-foreground text-sm mb-6">{listing.title}</p>

        {/* Step progress */}
        <div className="flex gap-1 mb-8">
          {STEPS.map(s => (
            <div key={s.id} className={`h-1.5 flex-1 rounded-full transition-colors ${s.id <= step ? "bg-[#00C896]" : "bg-gray-200"}`} />
          ))}
        </div>

        {/* Step header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#1B2B5E]/10 flex items-center justify-center">
            <StepIcon className="h-5 w-5 text-[#1B2B5E]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Step {step} of {STEPS.length}</p>
            <h2 className="font-bold text-foreground">{currentStep.title}</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">

            {/* STEP 1: Property Details */}
            {step === 1 && (
              <>
                <div>
                  <Label>Listing Title</Label>
                  <Input {...register("title")} className="mt-1.5" placeholder="e.g. Spacious 2BR near Downtown" />
                </div>
                <div>
                  <Label>Property Type</Label>
                  <Select value={watchedValues.propertyType} onValueChange={v => setValue("propertyType", v)}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map(pt => <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* STEP 2: Location */}
            {step === 2 && (
              <>
                <div>
                  <Label>Street Address</Label>
                  <Input {...register("address")} className="mt-1.5" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input {...register("city")} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Select value={watchedValues.state} onValueChange={v => setValue("state", v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>{US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>ZIP Code</Label>
                    <Input {...register("zip")} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Neighborhood (optional)</Label>
                    <Input {...register("neighborhood")} className="mt-1.5" />
                  </div>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={geocodeAddress} disabled={geocoding} className="gap-2">
                  {geocoding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5" />}
                  Verify on Map
                </Button>
              </>
            )}

            {/* STEP 3: Pricing & Specs */}
            {step === 3 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Monthly Rent ($)</Label>
                    <Input type="number" {...register("monthlyRent")} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Security Deposit ($)</Label>
                    <Input type="number" {...register("securityDeposit")} className="mt-1.5" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Bedrooms</Label>
                    <Select value={watchedValues.bedrooms} onValueChange={v => setValue("bedrooms", v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>{BEDROOM_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Bathrooms</Label>
                    <Select value={watchedValues.bathrooms} onValueChange={v => setValue("bathrooms", v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["1","1.5","2","2.5","3","3.5","4+"].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Sq Ft</Label>
                    <Input type="number" {...register("squareFeet")} className="mt-1.5" />
                  </div>
                </div>
                <div>
                  <Label>Available Date</Label>
                  <Input type="date" {...register("availableDate")} className="mt-1.5" />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {(["petFriendly","isCoLiving","parkingAvailable","washerDryer","airConditioning","dishwasher"] as const).map(key => (
                    <div key={key} className="flex items-center justify-between rounded-lg border p-3">
                      <Label className="capitalize text-sm">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                      <Switch checked={!!watchedValues[key]} onCheckedChange={v => setValue(key, v)} />
                    </div>
                  ))}
                </div>
                <div>
                  <Label>Utilities</Label>
                  <Select value={watchedValues.utilities} onValueChange={v => setValue("utilities", v)}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="included">Included</SelectItem>
                      <SelectItem value="not_included">Not Included</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* STEP 4: Photos & Description */}
            {step === 4 && (
              <>
                <div>
                  <Label>Photos</Label>
                  <label className="mt-1.5 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-[#00C896] transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Click to upload more photos</span>
                    <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="sr-only" />
                  </label>
                  {uploading && <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Uploading...</p>}
                  {photos.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {photos.map((p, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                          <img src={p} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                            className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea {...register("description")} rows={5} className="mt-1.5" placeholder="Describe the property..." />
                </div>
              </>
            )}

            {/* STEP 5: Contact */}
            {step === 5 && (
              <>
                <div>
                  <Label>Contact Name</Label>
                  <Input {...register("contactName")} className="mt-1.5" />
                </div>
                <div>
                  <Label>Contact Email</Label>
                  <Input type="email" {...register("contactEmail")} className="mt-1.5" />
                </div>
                <div>
                  <Label>Contact Phone</Label>
                  <Input {...register("contactPhone")} className="mt-1.5" />
                </div>
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)} className="gap-2">
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
            ) : (
              <div />
            )}
            {step < STEPS.length ? (
              <Button type="button" onClick={() => setStep(s => s + 1)} className="gap-2 bg-[#1B2B5E] hover:bg-[#1B2B5E]/90 text-white">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="gap-2 bg-[#00C896] hover:bg-[#00C896]/90 text-[#0a2a1f] font-bold"
              >
                {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Save Changes
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
