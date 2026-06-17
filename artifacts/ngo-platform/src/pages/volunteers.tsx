import { useState } from "react";
import { useListVolunteers, useCreateVolunteer } from "@workspace/api-client-react";
import { Users, MapPin, Clock, Phone, Loader2, CheckCircle, Heart, HandHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { AP_DISTRICTS } from "@/lib/constants";

const SKILL_TAGS = [
  "Medical / First Aid", "Food Distribution", "Rescue Operations",
  "Counselling / Support", "Transport / Driving", "Teaching / Education",
  "Construction / Repair", "Tech Support", "Fundraising", "Administration",
];

const volunteerSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  phone: z.string().min(10, "Enter valid phone number"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  district: z.string().min(1, "Select your district"),
  skills: z.string().min(3, "Describe your skills"),
  availability: z.string().min(1, "Select availability"),
  aadhaarRef: z.string().optional(),
});

type VolunteerForm = z.infer<typeof volunteerSchema>;

function RegisterForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutateAsync } = useCreateVolunteer();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const form = useForm<VolunteerForm>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: { availability: "weekends" },
  });

  function toggleSkill(skill: string) {
    const next = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(next);
    form.setValue("skills", next.join(", "), { shouldValidate: true });
  }

  async function onSubmit(values: VolunteerForm) {
    try {
      await mutateAsync({ data: { ...values, email: values.email || undefined, aadhaarRef: values.aadhaarRef || undefined } });
      await queryClient.invalidateQueries({ queryKey: ["listVolunteers"] });
      toast({
        title: "Registered as Volunteer!",
        description: "Thank you for stepping up. We'll contact you when help is needed in your district.",
      });
      onClose();
    } catch {
      toast({ title: "Registration failed", description: "Please try again.", variant: "destructive" });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
          ✅ Volunteers are matched to help requests in their district. Your contact will only be shared with verified admins.
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name *</FormLabel>
              <FormControl><Input placeholder="Your name" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem>
              <FormLabel>Phone *</FormLabel>
              <FormControl><Input placeholder="10-digit mobile" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email (optional)</FormLabel>
            <FormControl><Input type="email" placeholder="For notifications" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="district" render={({ field }) => (
            <FormItem>
              <FormLabel>Your District *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger></FormControl>
                <SelectContent>
                  {AP_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="availability" render={({ field }) => (
            <FormItem>
              <FormLabel>Availability *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="anytime">Anytime</SelectItem>
                  <SelectItem value="weekends">Weekends only</SelectItem>
                  <SelectItem value="weekdays">Weekdays only</SelectItem>
                  <SelectItem value="emergencies_only">Emergencies only</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="skills" render={({ field }) => (
          <FormItem>
            <FormLabel>Skills & Expertise *</FormLabel>
            <div className="flex flex-wrap gap-2 mb-2">
              {SKILL_TAGS.map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    selectedSkills.includes(skill)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
            <FormControl>
              <Input placeholder="Or type your skills here..." {...field} value={field.value || ""} />
            </FormControl>
            <FormDescription>Select from above or type custom skills</FormDescription>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="aadhaarRef" render={({ field }) => (
          <FormItem>
            <FormLabel>Aadhaar Last 4 Digits (optional)</FormLabel>
            <FormControl><Input placeholder="For identity verification" maxLength={4} {...field} /></FormControl>
            <FormDescription>Helps verify your identity for sensitive volunteer tasks</FormDescription>
            <FormMessage />
          </FormItem>
        )} />

        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Registering...</> : "Register as Volunteer"}
        </Button>
      </form>
    </Form>
  );
}

export default function Volunteers() {
  const [district, setDistrict] = useState("all");
  const [open, setOpen] = useState(false);

  const { data: volunteers, isLoading } = useListVolunteers({
    district: district !== "all" ? district : undefined,
  });

  const availabilityLabel: Record<string, string> = {
    anytime: "Anytime",
    weekends: "Weekends",
    weekdays: "Weekdays",
    emergencies_only: "Emergencies",
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 text-center max-w-2xl mx-auto space-y-4">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <HandHeart className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-display font-bold">Volunteer Network</h1>
        <p className="text-lg text-muted-foreground">
          Join our growing network of volunteers across Andhra Pradesh. Get matched to help requests in your district — food, medical, rescue, or any kind of support.
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
              <Heart className="w-5 h-5 mr-2" />Become a Volunteer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Register as a Volunteer</DialogTitle>
            </DialogHeader>
            <RegisterForm onClose={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {[
          { icon: "🎯", title: "District Matching", desc: "Matched to requests in your district automatically" },
          { icon: "📱", title: "Direct Contact", desc: "Admins contact you when help is needed nearby" },
          { icon: "🏅", title: "Volunteer Badge", desc: "Earn recognition for your contributions" },
        ].map(f => (
          <div key={f.title} className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">{f.icon}</div>
            <h3 className="font-semibold mb-1">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Active Volunteers</h2>
        <Select value={district} onValueChange={setDistrict}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Districts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            {AP_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : !volunteers?.length ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No volunteers yet in {district !== "all" ? district : "this area"}</h3>
          <p className="text-muted-foreground mb-4">Be the first to join the volunteer network!</p>
          <Button onClick={() => setOpen(true)} className="bg-green-600 hover:bg-green-700">
            Register Now
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {volunteers.map(v => (
            <Card key={v.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700">
                    {v.name[0].toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-sm">{v.name}</CardTitle>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{v.district}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {v.skills.split(",").slice(0, 3).map(s => (
                    <Badge key={s} variant="secondary" className="text-xs">{s.trim()}</Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{availabilityLabel[v.availability] || v.availability}</span>
                  <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
