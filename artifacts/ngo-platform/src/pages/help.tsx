import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useCreateHelpRequest } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { AlertCircle, Camera, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { AP_DISTRICTS, HELP_CATEGORIES, URGENCY_LEVELS } from "@/lib/constants";

const helpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  location: z.string().min(5, "Please provide a specific location or address"),
  district: z.string().min(1, "Please select a district"),
  category: z.enum(["medical", "blood_donation", "shelter", "food", "education", "disability_aid", "elderly_care", "other"]),
  description: z.string().min(10, "Please describe the situation in detail"),
  urgency: z.enum(["low", "medium", "high", "critical"]),
});

type HelpFormValues = z.infer<typeof helpSchema>;

export default function HelpRequest() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const createHelpRequest = useCreateHelpRequest();
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);

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
      toast({ title: "Photo uploaded", description: "Attached to your help request." });
    } catch {
      toast({ title: "Upload failed", description: "Could not upload photo.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  const form = useForm<HelpFormValues>({
    resolver: zodResolver(helpSchema),
    defaultValues: {
      name: "", phone: "", email: "", location: "", district: "",
      category: "other", description: "", urgency: "medium",
    },
  });

  const onSubmit = (data: HelpFormValues) => {
    createHelpRequest.mutate(
      { data: { ...data, photoUrl } },
      {
        onSuccess: () => {
          toast({
            title: "Help Request Submitted ✅",
            description: "Your request has been logged. Our partner organizations and admin will review it shortly.",
          });
          setLocation("/");
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || "Failed to submit request. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-4">Request Assistance</h1>
          <p className="text-muted-foreground text-lg">
            If you or someone you know needs help, fill out this form. We'll connect you with verified organizations in your district.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            No login required. All information is kept confidential.
          </p>
        </div>

        {/* Community Alert Banner */}
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Users className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-purple-900">Seen someone in need on the street?</p>
            <p className="text-sm text-purple-700 mt-0.5">
              Use the{" "}
              <Link href="/community" className="underline font-medium hover:text-purple-900">
                Community Help Board
              </Link>{" "}
              to quickly post an alert for someone you've seen — beggar, abandoned elderly, hungry child, etc.
            </p>
          </div>
        </div>

        <div className="bg-card border-t-4 border-t-destructive rounded-2xl p-6 md:p-8 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Type of Help Needed</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {HELP_CATEGORIES.map((c) => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="urgency" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urgency Level *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select urgency" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {URGENCY_LEVELS.map((u) => (
                            <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs">
                        Choose 'Critical' only for life-threatening situations.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the situation, who needs help, and what specific assistance is required (medical, blood group if applicable, books needed, etc.)"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="font-semibold text-lg border-b pb-2">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="district" render={({ field }) => (
                    <FormItem>
                      <FormLabel>District *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AP_DISTRICTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specific Location / Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="Mandal, Village, Landmark" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="font-semibold text-lg border-b pb-2">Contact Person</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl><Input placeholder="Your Name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl><Input type="tel" placeholder="Mobile Number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Email Address (Optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="For updates on your request" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <h3 className="font-semibold text-lg border-b pb-2">Supporting Photo (Optional)</h3>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  <Camera className="w-7 h-7 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-3">Attaching a photo helps volunteers and admins understand the situation better.</p>
                  <label className="cursor-pointer">
                    <span className="text-sm bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition-colors">
                      {uploading ? "Uploading..." : photoUrl ? "✓ Photo attached" : "Choose Photo"}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full text-lg h-12 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                disabled={createHelpRequest.isPending}
              >
                {createHelpRequest.isPending ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting Request...</>
                ) : "Submit Help Request"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                No login or account required. Your request is treated with full confidentiality.
              </p>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
