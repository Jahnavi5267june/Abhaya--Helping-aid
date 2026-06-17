import { useState } from "react";
import { useListDisasterReports, useCreateDisasterReport } from "@workspace/api-client-react";
import { AlertTriangle, MapPin, Phone, Clock, Camera, ChevronDown, Plus, Loader2, CheckCircle, Waves, CloudRain, Flame, Car, MountainSnow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { AP_DISTRICTS } from "@/lib/constants";

const DISASTER_TYPES = [
  { value: "flood", label: "Flood", emoji: "🌊" },
  { value: "drought", label: "Drought", emoji: "☀️" },
  { value: "cyclone", label: "Cyclone", emoji: "🌀" },
  { value: "earthquake", label: "Earthquake", emoji: "🏔" },
  { value: "fire", label: "Fire", emoji: "🔥" },
  { value: "accident", label: "Road/Railway Accident", emoji: "🚧" },
  { value: "landslide", label: "Landslide", emoji: "⛰️" },
  { value: "other", label: "Other Emergency", emoji: "⚠️" },
];

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_COLORS: Record<string, string> = {
  reported: "bg-blue-100 text-blue-800",
  verified: "bg-purple-100 text-purple-800",
  responding: "bg-orange-100 text-orange-800",
  resolved: "bg-green-100 text-green-800",
};

const reportSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Please describe the situation in detail (min 20 chars)"),
  disasterType: z.string().min(1, "Select disaster type"),
  location: z.string().min(3, "Enter the specific location"),
  district: z.string().min(1, "Select district"),
  severity: z.string().min(1, "Select severity"),
  reporterName: z.string().min(2, "Enter your name"),
  reporterPhone: z.string().min(10, "Enter valid phone number"),
  reporterEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  affectedCount: z.string().optional(),
});

type ReportForm = z.infer<typeof reportSchema>;

function ReportForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutateAsync } = useCreateDisasterReport();
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);

  const form = useForm<ReportForm>({
    resolver: zodResolver(reportSchema),
    defaultValues: { severity: "medium", disasterType: "flood" },
  });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      const { uploadURL, objectPath } = await res.json();
      await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      setPhotoUrl(objectPath);
      toast({ title: "Photo uploaded", description: "Your photo has been attached to this report." });
    } catch {
      toast({ title: "Upload failed", description: "Could not upload photo. Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(values: ReportForm) {
    try {
      await mutateAsync({ data: {
        ...values,
        disasterType: values.disasterType as "flood" | "drought" | "cyclone" | "earthquake" | "fire" | "accident" | "landslide" | "other",
        severity: values.severity as "low" | "medium" | "high" | "critical",
        photoUrl,
        reporterEmail: values.reporterEmail || undefined,
      } });
      await queryClient.invalidateQueries({ queryKey: ["listDisasterReports"] });
      toast({
        title: "Report Submitted!",
        description: "Our team has been notified. Stay safe.",
      });
      onClose();
    } catch {
      toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
          ⚠️ For immediate life-threatening emergencies, call <strong>112</strong> first. Use this form to report to our volunteer network.
        </div>

        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Report Title *</FormLabel>
            <FormControl><Input placeholder="e.g. Heavy flooding in Eluru town centre" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="disasterType" render={({ field }) => (
            <FormItem>
              <FormLabel>Disaster Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {DISASTER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.emoji} {t.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="severity" render={({ field }) => (
            <FormItem>
              <FormLabel>Severity *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🟠 High</SelectItem>
                  <SelectItem value="critical">🔴 Critical</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="district" render={({ field }) => (
            <FormItem>
              <FormLabel>District *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger></FormControl>
                <SelectContent>
                  {AP_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="location" render={({ field }) => (
            <FormItem>
              <FormLabel>Specific Location *</FormLabel>
              <FormControl><Input placeholder="Village, road, landmark" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>What is happening? *</FormLabel>
            <FormControl><Textarea rows={3} placeholder="Describe the situation in detail — what happened, how severe it is, what is needed..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="affectedCount" render={({ field }) => (
          <FormItem>
            <FormLabel>Estimated people affected</FormLabel>
            <FormControl><Input placeholder="e.g. 50 families, 200 people" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
          <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">Attach a photo of the situation (optional but helpful)</p>
          <label className="cursor-pointer">
            <span className="text-sm bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors">
              {uploading ? "Uploading..." : photoUrl ? "✓ Photo attached" : "Choose Photo"}
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
          </label>
        </div>

        <div className="border-t pt-4 space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Your Contact Details</p>
          <div className="grid grid-cols-2 gap-3">
            <FormField control={form.control} name="reporterName" render={({ field }) => (
              <FormItem>
                <FormLabel>Your Name *</FormLabel>
                <FormControl><Input placeholder="Full name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="reporterPhone" render={({ field }) => (
              <FormItem>
                <FormLabel>Phone *</FormLabel>
                <FormControl><Input placeholder="10-digit mobile" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={form.control} name="reporterEmail" render={({ field }) => (
            <FormItem>
              <FormLabel>Email (optional)</FormLabel>
              <FormControl><Input type="email" placeholder="For updates" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : "Submit Disaster Report"}
        </Button>
      </form>
    </Form>
  );
}

export default function DisasterReports() {
  const [district, setDistrict] = useState("all");
  const [type, setType] = useState("all");
  const [open, setOpen] = useState(false);

  const { data: reports, isLoading } = useListDisasterReports({
    district: district !== "all" ? district : undefined,
    type: type !== "all" ? type : undefined,
  });

  const typeInfo = (t: string) => DISASTER_TYPES.find(d => d.value === t) ?? { emoji: "⚠️", label: t };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 text-center max-w-2xl mx-auto space-y-4">
        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Waves className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-display font-bold">Community Disaster Reports</h1>
        <p className="text-lg text-muted-foreground">
          Real-time reports from the community — floods, droughts, accidents and more across Andhra Pradesh. Anyone can report.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white">
                <Plus className="w-5 h-5 mr-2" />Report a Disaster
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Report a Disaster or Emergency</DialogTitle>
              </DialogHeader>
              <ReportForm onClose={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
          <Button variant="outline" asChild>
            <a href="/disaster">View Relief Campaigns →</a>
          </Button>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
        <div className="text-sm text-orange-800">
          <strong>For life-threatening emergencies call 112.</strong> These reports are reviewed by our volunteer network and forwarded to local authorities.
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <Select value={district} onValueChange={setDistrict}>
          <SelectTrigger className="w-full md:w-[220px]">
            <SelectValue placeholder="All Districts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            {AP_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {DISASTER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.emoji} {t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : !reports?.length ? (
        <div className="text-center py-20">
          <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No active disaster reports</h3>
          <p className="text-muted-foreground">No reports matching your filters. Stay safe — if you see an emergency, report it above.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {reports.map(report => {
            const t = typeInfo(report.disasterType);
            return (
              <Card key={report.id} className="border-l-4" style={{ borderLeftColor: report.severity === "critical" ? "#dc2626" : report.severity === "high" ? "#ea580c" : report.severity === "medium" ? "#d97706" : "#16a34a" }}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{t.emoji}</span>
                        <Badge variant="outline" className={SEVERITY_COLORS[report.severity]}>
                          {report.severity.toUpperCase()}
                        </Badge>
                        <Badge className={STATUS_COLORS[report.status]}>{report.status}</Badge>
                      </div>
                      <CardTitle className="text-base leading-tight">{report.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">{report.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{report.location}, {report.district}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(report.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  {report.affectedCount && (
                    <p className="text-xs font-medium text-orange-700">👥 ~{report.affectedCount} affected</p>
                  )}
                  {report.photoUrl && (
                    <img
                      src={`/api/storage${report.photoUrl}`}
                      alt="Disaster photo"
                      className="w-full h-32 object-cover rounded-md mt-2"
                    />
                  )}
                  <div className="flex items-center justify-between pt-1 border-t">
                    <span className="text-xs text-muted-foreground">
                      Reported by {report.reporterName}
                    </span>
                    <a href={`tel:${report.reporterPhone}`} className="flex items-center gap-1 text-xs text-primary hover:underline">
                      <Phone className="w-3 h-3" />{report.reporterPhone}
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
