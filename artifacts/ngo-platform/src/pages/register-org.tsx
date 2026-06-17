import { useState } from "react";
import { useCreateOrgRegistration } from "@workspace/api-client-react";
import { Building2, CheckCircle, FileText, Phone, Mail, Loader2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";
import { AP_DISTRICTS } from "@/lib/constants";

const orgSchema = z.object({
  name: z.string().min(3, "Organization name required"),
  type: z.string().min(1, "Select organization type"),
  district: z.string().min(1, "Select district"),
  address: z.string().min(10, "Enter full address"),
  phone: z.string().min(10, "Enter valid phone number"),
  email: z.string().email("Enter valid email"),
  contactPerson: z.string().min(2, "Enter contact person name"),
  registrationNumber: z.string().optional(),
  description: z.string().min(30, "Please describe your organization (min 30 chars)"),
  capacity: z.string().optional(),
});

type OrgForm = z.infer<typeof orgSchema>;

export default function RegisterOrg() {
  const { toast } = useToast();
  const { mutateAsync } = useCreateOrgRegistration();
  const [submitted, setSubmitted] = useState(false);
  const [docUrl, setDocUrl] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);

  const form = useForm<OrgForm>({
    resolver: zodResolver(orgSchema),
  });

  async function handleDocUpload(e: React.ChangeEvent<HTMLInputElement>) {
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
      setDocUrl(objectPath);
      toast({ title: "Document uploaded", description: "Your registration document has been attached." });
    } catch {
      toast({ title: "Upload failed", description: "Could not upload document. Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(values: OrgForm) {
    try {
      await mutateAsync({ data: { ...values, type: values.type as "old_age_home" | "orphanage" | "other", registrationNumber: values.registrationNumber || undefined, capacity: values.capacity || undefined, documentUrl: docUrl } });
      setSubmitted(true);
    } catch {
      toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" });
    }
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-display font-bold mb-4">Registration Submitted!</h1>
        <p className="text-muted-foreground mb-6">
          Your organization registration has been received. Our admin team will review it and get back to you at the email provided within <strong>3–5 working days</strong>.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 text-left mb-8">
          <strong>What happens next?</strong>
          <ol className="list-decimal ml-4 mt-2 space-y-1">
            <li>Admin reviews your documents and details</li>
            <li>A verification call may be scheduled</li>
            <li>On approval, your org is listed on the platform</li>
            <li>You can then receive donations and post volunteer needs</li>
          </ol>
        </div>
        <Button asChild variant="outline">
          <a href="/organizations">View Organizations →</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="mb-10 text-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-display font-bold">Register Your Organization</h1>
        <p className="text-lg text-muted-foreground">
          Old age homes, orphanages, and welfare organizations across Andhra Pradesh can register to receive donations and connect with volunteers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {[
          { icon: "💰", title: "Receive Donations", desc: "Listed on donor platform for direct contributions" },
          { icon: "🤝", title: "Get Volunteers", desc: "Connect with trained volunteers in your district" },
          { icon: "✅", title: "Verified Badge", desc: "Admin verification builds donor trust" },
        ].map(f => (
          <div key={f.title} className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">{f.icon}</div>
            <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
            <p className="text-xs text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-6 md:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="pb-2 border-b">
              <h2 className="font-semibold text-lg">Organization Details</h2>
            </div>

            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Name *</FormLabel>
                <FormControl><Input placeholder="Full legal name of the organization" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="old_age_home">🏠 Old Age Home</SelectItem>
                      <SelectItem value="orphanage">🏫 Orphanage</SelectItem>
                      <SelectItem value="other">🏢 Other Welfare Org</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
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
            </div>

            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel>Full Address *</FormLabel>
                <FormControl><Textarea rows={2} placeholder="Street address, landmark, pincode" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>About Your Organization *</FormLabel>
                <FormControl><Textarea rows={3} placeholder="Who do you serve? How many residents? What services do you provide? What help do you need?" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="capacity" render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Capacity</FormLabel>
                  <FormControl><Input placeholder="e.g. 50 residents" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="registrationNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>NGO Registration No. (if any)</FormLabel>
                  <FormControl><Input placeholder="Society/Trust reg number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="pb-2 border-b pt-2">
              <h2 className="font-semibold text-lg">Contact Information</h2>
            </div>

            <FormField control={form.control} name="contactPerson" render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Person Name *</FormLabel>
                <FormControl><Input placeholder="Name of the primary contact" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl><Input placeholder="10-digit mobile" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl><Input type="email" placeholder="Official email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="pb-2 border-b pt-2">
              <h2 className="font-semibold text-lg">Supporting Documents</h2>
            </div>

            <div className="border-2 border-dashed border-border rounded-lg p-5 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-1">Upload registration certificate, trust deed, or any relevant document</p>
              <p className="text-xs text-muted-foreground mb-3">PDF, JPG, PNG — up to 10MB</p>
              <label className="cursor-pointer">
                <span className="text-sm bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors">
                  {uploading ? "Uploading..." : docUrl ? "✓ Document attached" : "Choose Document"}
                </span>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleDocUpload} disabled={uploading} />
              </label>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
              By submitting, you confirm that all information provided is accurate and your organization genuinely serves those in need.
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : "Submit Registration Request"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
