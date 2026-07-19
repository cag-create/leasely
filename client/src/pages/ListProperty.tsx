import { useState, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Navbar from "@/components/Navbar";
import { loadMapScript } from "@/components/Map";
import { toast } from "sonner";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  MapPin, Upload, ChevronRight, ChevronLeft, CheckCircle2,
  Building2, DollarSign, Image, User, Sparkles, Lock, ArrowRight, Loader2
} from "lucide-react";
import { PROPERTY_TYPES, BEDROOM_OPTIONS, US_STATES } from "@/lib/marketplace";
import { prepareImageForUpload } from "@/lib/imageUpload";
import { Link } from "wouter";
import RentSuggestionWidget from "@/components/RentSuggestionWidget";

const BRAND = "#1B2B5E";
const ACCENT = "#4F46E5";

const STEPS = [
  { id: 1, title: "Property Details", icon: Building2 },
  { id: 2, title: "Location", icon: MapPin },
  { id: 3, title: "Pricing & Specs", icon: DollarSign },
  { id: 4, title: "Photos & Description", icon: Image },
  { id: 5, title: "Contact Info", icon: User },
];

type FormData = {
  title: string;
  propertyType: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  neighborhood: string;
  monthlyRent: number;
  securityDeposit: number;
  bedrooms: string;
  bathrooms: string;
  squareFeet: number;
  availableDate: string;
  petFriendly: boolean;
  isCoLiving: boolean;
  parkingAvailable: boolean;
  washerDryer: boolean;
  airConditioning: boolean;
  dishwasher: boolean;
  utilities: string;
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  listPublicly: boolean;
};

export default function ListProperty() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodedCoords, setGeocodedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { data: tierData } = trpc.marketplace.getUserTier.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: myListings = [] } = trpc.marketplace.getMyListings.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const wasPrivateRef = useRef(false);

  const createMutation = trpc.marketplace.createListing.useMutation({
    onSuccess: ({ id }) => {
      if (wasPrivateRef.current) {
        toast.success("Property added privately — it won't appear on the marketplace.");
        navigate("/my-listings");
      } else {
        toast.success("Your listing is live! 🎉");
        navigate(`/listing/${id}`);
      }
    },
    onError: (err) => {
      if (err.message === "UPGRADE_REQUIRED") {
        setShowUpgradeModal(true);
      } else {
        toast.error("Failed to create listing. Please try again.");
      }
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      propertyType: "apartment",
      bedrooms: "1",
      bathrooms: "1",
      utilities: "not_included",
      state: "NC",
      contactName: user?.name ?? "",
      contactEmail: user?.email ?? "",
      listPublicly: true,
    },
  });

  const watchedValues = watch();

  const geocodeAddress = useCallback(async () => {
    const addr = `${watchedValues.address}, ${watchedValues.city}, ${watchedValues.state} ${watchedValues.zip}`;
    if (!watchedValues.address || !watchedValues.city) return;

    setGeocoding(true);
    try {
      await loadMapScript();
      if (!window.google?.maps) {
        toast.error("Map service unavailable. Your listing will still be created.");
        setGeocoding(false);
        return;
      }
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: addr }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          const loc = results[0].geometry.location;
          setGeocodedCoords({ lat: loc.lat(), lng: loc.lng() });
          toast.success("Address geocoded — your property will appear on the map!");
        } else {
          toast.error("Could not geocode address. Your listing will still be created.");
        }
        setGeocoding(false);
      });
    } catch (err) {
      console.error("[Geocode] error:", err);
      toast.error("Could not load map service. Your listing will still be created.");
      setGeocoding(false);
    }
  }, [watchedValues.address, watchedValues.city, watchedValues.state, watchedValues.zip]);

  const MAX_PHOTOS = 10;

  const uploadFiles = useCallback(async (files: File[]) => {
    setPhotos(prev => {
      const remaining = MAX_PHOTOS - prev.length;
      if (remaining <= 0) { toast.error(`Maximum ${MAX_PHOTOS} photos allowed`); return prev; }
      return prev; // actual add happens after upload
    });
    setUploading(true);
    for (const file of files) {
      try {
        setPhotos(prev => {
          if (prev.length >= MAX_PHOTOS) { toast.error(`Maximum ${MAX_PHOTOS} photos allowed`); return prev; }
          return prev;
        });
        const dataUrl = await prepareImageForUpload(file);
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl, filename: file.name }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.url) {
          setPhotos(prev => {
            if (prev.length >= MAX_PHOTOS) { toast.error(`Maximum ${MAX_PHOTOS} photos allowed`); return prev; }
            return [...prev, data.url];
          });
        } else {
          toast.error(data.error || `Upload failed (${res.status})`);
        }
      } catch (err: any) {
        toast.error(err?.message || "Could not read photo");
      }
    }
    setUploading(false);
  }, []);

  const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    await uploadFiles(files);
  }, [uploadFiles]);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length === 0) return;
    await uploadFiles(files);
  }, [uploadFiles]);

  const onSubmit = (data: FormData) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    wasPrivateRef.current = !data.listPublicly;
    createMutation.mutate({
      listPublicly: data.listPublicly,
      title: data.title,
      description: data.description,
      propertyType: data.propertyType as any,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      neighborhood: data.neighborhood,
      latitude: geocodedCoords?.lat,
      longitude: geocodedCoords?.lng,
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

  const nextStep = () => {
    if (step < STEPS.length) setStep(s => s + 1);
  };
  const prevStep = () => {
    if (step > 1) setStep(s => s - 1);
  };

  const isFreeTierWithListing = tierData?.tier === "free" && myListings.filter(l => l.status === "active").length >= 1;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 max-w-lg py-24 text-center">
          <div className="bg-white rounded-3xl p-10 shadow-sm border">
            <Lock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-gray-900 mb-3">Sign In to List Your Property</h2>
            <p className="text-gray-500 mb-6">Create a free account to list your first property on the Keycove marketplace.</p>
            <a href={getLoginUrl()}>
              <Button size="lg" className="w-full font-bold" style={{ background: ACCENT, color: "#3A2410" }}>
                Sign In / Create Account
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `linear-gradient(135deg, ${BRAND}, ${ACCENT})` }}>
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Upgrade to List More</h2>
              <p className="text-gray-500">
                Your free tier includes 1 listing. Upgrade to Pro for unlimited listings, AI fraud applicant detection, and your branded portal.
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-5 mb-6">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-black text-gray-900">$25.00</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                {["Unlimited listings", "AI fraud applicant detection", "Branded portal", "Background check integration"].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowUpgradeModal(false)}>
                Maybe Later
              </Button>
              <Link href="/dashboard">
                <Button className="flex-1 font-bold" style={{ background: ACCENT, color: "#3A2410" }}>
                  Upgrade Now <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-3xl py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge className="mb-3" style={{ background: `${ACCENT}15`, color: ACCENT, border: "none" }}>
            {tierData?.tier === "free" ? "Free Listing" : "Pro Listing"}
          </Badge>
          <h1 className="text-3xl font-black text-gray-900">List Your Property</h1>
          <p className="text-gray-500 mt-2">
            {tierData?.tier === "free"
              ? "Your first listing is completely free — no credit card required."
              : "Unlimited listings included in your Pro plan."}
          </p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step > s.id
                      ? "bg-emerald-500 text-white"
                      : step === s.id
                      ? "text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                  style={step === s.id ? { background: BRAND } : {}}
                >
                  {step > s.id ? <CheckCircle2 className="h-5 w-5" /> : s.id}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step === s.id ? "text-gray-900" : "text-gray-400"}`}>
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-all ${step > s.id ? "bg-emerald-500" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">

            {/* Step 1: Property Details */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-gray-900">Property Details</h2>
                <div>
                  <Label htmlFor="title">Listing Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Spacious 2BR in South End Charlotte"
                    className="mt-1.5"
                    {...register("title", { required: "Title is required" })}
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <Label>Property Type *</Label>
                  <div className="grid grid-cols-3 gap-3 mt-1.5">
                    {PROPERTY_TYPES.filter(t => t.value !== "all").map(t => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setValue("propertyType", t.value)}
                        className={`px-3 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                          watchedValues.propertyType === t.value
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-gray-200 hover:border-gray-300 text-gray-600"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
                    <div>
                      <div className="font-medium text-gray-900">Pet Friendly</div>
                      <div className="text-xs text-gray-400">Allows pets</div>
                    </div>
                    <Switch checked={watchedValues.petFriendly} onCheckedChange={v => setValue("petFriendly", v)} />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
                    <div>
                      <div className="font-medium text-gray-900">Co-Living</div>
                      <div className="text-xs text-gray-400">Shared living</div>
                    </div>
                    <Switch checked={watchedValues.isCoLiving} onCheckedChange={v => setValue("isCoLiving", v)} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-gray-900">Location</h2>
                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Input id="address" placeholder="123 Main St" className="mt-1.5" {...register("address", { required: true })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" placeholder="Charlotte" className="mt-1.5" {...register("city", { required: true })} />
                  </div>
                  <div>
                    <Label>State *</Label>
                    <Select value={watchedValues.state} onValueChange={v => setValue("state", v)}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zip">ZIP Code *</Label>
                    <Input id="zip" placeholder="28202" className="mt-1.5" {...register("zip", { required: true })} />
                  </div>
                  <div>
                    <Label htmlFor="neighborhood">Neighborhood</Label>
                    <Input id="neighborhood" placeholder="South End" className="mt-1.5" {...register("neighborhood")} />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={geocodeAddress}
                  disabled={geocoding || !watchedValues.address || !watchedValues.city}
                  className="w-full gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  {geocoding ? "Geocoding..." : geocodedCoords ? "✅ Location found on map!" : "Place on Map (Auto-geocode)"}
                </Button>
                {geocodedCoords && (
                  <p className="text-sm text-emerald-600 text-center">
                    📍 Coordinates: {geocodedCoords.lat.toFixed(4)}, {geocodedCoords.lng.toFixed(4)}
                  </p>
                )}
              </div>
            )}

            {/* Step 3: Pricing & Specs */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-gray-900">Pricing & Specs</h2>

                <RentSuggestionWidget
                  zip={watchedValues.zip}
                  bedrooms={watchedValues.bedrooms}
                  proposedRent={Number(watchedValues.monthlyRent) || 0}
                  onAccept={(rent) => setValue("monthlyRent", rent as any)}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="monthlyRent">Monthly Rent ($) *</Label>
                    <Input id="monthlyRent" type="number" placeholder="1500" className="mt-1.5" {...register("monthlyRent", { required: true, min: 1 })} />
                  </div>
                  <div>
                    <Label htmlFor="securityDeposit">Security Deposit ($)</Label>
                    <Input id="securityDeposit" type="number" placeholder="1500" className="mt-1.5" {...register("securityDeposit")} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Bedrooms *</Label>
                    <Select value={watchedValues.bedrooms} onValueChange={v => setValue("bedrooms", v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {BEDROOM_OPTIONS.filter(b => b.value !== "any").map(b => (
                          <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Bathrooms *</Label>
                    <Select value={watchedValues.bathrooms} onValueChange={v => setValue("bathrooms", v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["1", "1.5", "2", "2.5", "3", "3.5", "4+"].map(b => (
                          <SelectItem key={b} value={b}>{b} ba</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="squareFeet">Sq Ft</Label>
                    <Input id="squareFeet" type="number" placeholder="850" className="mt-1.5" {...register("squareFeet")} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="availableDate">Available Date</Label>
                    <Input id="availableDate" type="date" className="mt-1.5" {...register("availableDate")} />
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
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: "parkingAvailable", label: "Parking" },
                    { key: "washerDryer", label: "W/D" },
                    { key: "airConditioning", label: "A/C" },
                    { key: "dishwasher", label: "Dishwasher" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-xl border border-gray-200">
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                      <Switch
                        checked={watchedValues[key as keyof FormData] as boolean}
                        onCheckedChange={v => setValue(key as keyof FormData, v as any)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Photos & Description */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-gray-900">Photos & Description</h2>
                <div>
                  <Label>Photos (up to 10)</Label>
                  <div
                    className={`mt-1.5 border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${dragging ? "border-emerald-400 bg-emerald-50" : "border-gray-200 hover:border-emerald-400"} ${photos.length >= MAX_PHOTOS ? "opacity-50 pointer-events-none" : ""}`}
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragEnter={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      id="photo-upload"
                      onChange={handlePhotoUpload}
                      disabled={photos.length >= MAX_PHOTOS}
                    />
                    <label htmlFor="photo-upload" className={photos.length >= MAX_PHOTOS ? "cursor-not-allowed" : "cursor-pointer"}>
                      {uploading
                        ? <><Loader2 className="h-10 w-10 text-emerald-400 mx-auto mb-3 animate-spin" /><p className="text-gray-500 font-medium">Uploading...</p></>
                        : photos.length >= MAX_PHOTOS
                          ? <><Upload className="h-10 w-10 text-gray-200 mx-auto mb-3" /><p className="text-gray-400 font-medium">Maximum {MAX_PHOTOS} photos reached</p></>
                          : <><Upload className={`h-10 w-10 mx-auto mb-3 ${dragging ? "text-emerald-400" : "text-gray-300"}`} /><p className="text-gray-500 font-medium">{dragging ? "Drop photos here" : "Drag & drop or click to upload"}</p><p className="text-gray-400 text-sm mt-1">JPG, PNG, WebP · up to {MAX_PHOTOS - photos.length} more photo{MAX_PHOTOS - photos.length !== 1 ? "s" : ""}</p></>
                      }
                    </label>
                  </div>
                  {photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {photos.map((p, i) => (
                        <div key={i} className="relative rounded-xl overflow-hidden h-24">
                          <img src={p} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full h-5 w-5 text-xs flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your property — highlights, nearby amenities, what makes it special..."
                    className="mt-1.5 min-h-32"
                    {...register("description")}
                  />
                </div>
              </div>
            )}

            {/* Step 5: Contact Info */}
            {step === 5 && (
              <div className="space-y-6">
                <h2 className="text-xl font-black text-gray-900">Visibility & Contact</h2>

                {/* Public vs. private (management-only) */}
                <div className={`rounded-2xl border-2 p-4 transition-all ${watchedValues.listPublicly ? "border-emerald-200 bg-emerald-50/40" : "border-indigo-200 bg-indigo-50/40"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {watchedValues.listPublicly ? "List on the marketplace" : "Private — management only"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 max-w-md">
                        {watchedValues.listPublicly
                          ? "Your property will be publicly visible in search, on the map, and open to applications."
                          : "The property is added for rent collection, leases, and CRM only. It will NOT appear on the marketplace, map, or search — ideal for already-occupied units."}
                      </div>
                    </div>
                    <Switch
                      checked={watchedValues.listPublicly}
                      onCheckedChange={v => setValue("listPublicly", v)}
                    />
                  </div>
                </div>

                <p className="text-gray-500 text-sm">
                  {watchedValues.listPublicly
                    ? "This is how interested renters will reach you."
                    : "Contact details stay on file for your records."}
                </p>
                <div>
                  <Label htmlFor="contactName">Your Name *</Label>
                  <Input id="contactName" placeholder="Jane Smith" className="mt-1.5" {...register("contactName", { required: true })} />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Email *</Label>
                  <Input id="contactEmail" type="email" placeholder="jane@example.com" className="mt-1.5" {...register("contactEmail", { required: true })} />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Phone (optional)</Label>
                  <Input id="contactPhone" placeholder="(704) 555-0100" className="mt-1.5" {...register("contactPhone")} />
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-2xl p-5 space-y-2 text-sm">
                  <div className="font-semibold text-gray-900 mb-3">Listing Summary</div>
                  <div className="flex justify-between"><span className="text-gray-500">Title</span><span className="font-medium truncate max-w-48">{watchedValues.title}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium">{watchedValues.propertyType}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="font-medium">{watchedValues.city}, {watchedValues.state}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Rent</span><span className="font-medium text-emerald-600">${watchedValues.monthlyRent}/mo</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Beds/Baths</span><span className="font-medium">{watchedValues.bedrooms} bd / {watchedValues.bathrooms} ba</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Visibility</span><span className="font-medium">{watchedValues.listPublicly ? "Public listing" : "Private (management only)"}</span></div>
                  {geocodedCoords && watchedValues.listPublicly && <div className="flex justify-between"><span className="text-gray-500">Map Pin</span><span className="font-medium text-emerald-600">✅ Will appear on map</span></div>}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1} className="gap-2">
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              {step < STEPS.length ? (
                <Button type="button" onClick={nextStep} className="gap-2 font-bold" style={{ background: BRAND, color: "white" }}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="gap-2 font-bold px-8"
                  style={{ background: ACCENT, color: "#3A2410" }}
                >
                  {createMutation.isPending
                    ? "Saving..."
                    : watchedValues.listPublicly ? "Publish Listing 🚀" : "Add Private Property"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
