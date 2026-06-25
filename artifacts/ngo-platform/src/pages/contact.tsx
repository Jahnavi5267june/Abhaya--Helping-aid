import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { useSearch } from "wouter";
import { useCreateContactMessage } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Handshake, Building2, Heart, Users } from "lucide-react";

const SUBJECTS = [
  { value: "general", label: "General Inquiry" },
  { value: "partnership", label: "Partnership / Tie-Up Request" },
  { value: "media", label: "Media / Press Inquiry" },
  { value: "volunteer", label: "Volunteering" },
  { value: "donation_help", label: "Donation Help" },
  { value: "organization", label: "About an Organization" },
  { value: "other", label: "Other" },
];

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Please select a subject"),
  organization: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function Contact() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const preSubject = params.get("subject") || "";
  const { toast } = useToast();
  const { mutate: submit, isPending, isSuccess } = useCreateContactMessage();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: preSubject === "partnership" ? "partnership" : "",
      organization: "",
      message: preSubject === "partnership"
        ? "We are interested in partnering with Abhaya. Please find our details below:\n\n"
        : "",
    },
  });

  useEffect(() => {
    if (preSubject === "partnership") {
      form.setValue("subject", "partnership");
      form.setValue(
        "message",
        "We are interested in partnering with Abhaya. Please find our details below:\n\n"
      );
    }
  }, [preSubject]);

  function onSubmit(values: FormValues) {
    submit(
      {
        data: {
          name: values.name,
          email: values.email,
          phone: values.phone || undefined,
          subject: values.subject,
          organization: values.organization || undefined,
          message: values.message,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Message sent!",
            description: "We'll get back to you within 24–48 hours.",
          });
          form.reset();
        },
        onError: () => {
          toast({
            title: "Failed to send",
            description: "Please try again or email us directly at abhayaorg@gmail.com",
            variant: "destructive",
          });
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Hero */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-2 text-sm font-medium mb-2">
            <Mail className="w-4 h-4" />
            Get in Touch
          </div>
          <h1 className="text-4xl font-display font-bold">Contact Abhaya</h1>
          <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
            Whether you're a donor, NGO, media outlet, or simply want to learn more — we're here to help.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Info Cards */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Reach Out To Us</h2>
              <p className="text-muted-foreground text-sm">We typically respond within 24–48 hours on working days.</p>
            </div>

            <div className="bg-card border rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Email</p>
                  <a href="mailto:abhayaorg@gmail.com" className="text-sm font-semibold text-primary hover:underline">abhayaorg@gmail.com</a>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Handshake className="w-5 h-5 text-amber-700" />
                <h3 className="font-semibold text-amber-900">Partnership Inquiries</h3>
              </div>
              <p className="text-sm text-amber-800">
                Are you an NGO, corporate CSR team, or government body looking to collaborate? Select <strong>"Partnership / Tie-Up Request"</strong> in the form and tell us about your organization.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Common Inquiries</h3>
              {[
                { icon: Building2, text: "List your organization on Abhaya", color: "text-blue-600" },
                { icon: Heart, text: "Corporate CSR donation support", color: "text-primary" },
                { icon: Users, text: "Volunteer program coordination", color: "text-green-600" },
                { icon: MapPin, text: "District-level relief coordination", color: "text-orange-600" },
              ].map(({ icon: Icon, text, color }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Icon className={`w-4 h-4 ${color} shrink-0`} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center h-full py-24 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold text-green-800">Message Received!</h2>
                <p className="text-muted-foreground max-w-sm">Thank you for reaching out. Our team will respond within 24–48 hours.</p>
                <Button variant="outline" onClick={() => window.location.reload()}>Send Another Message</Button>
              </div>
            ) : (
              <div className="bg-card border rounded-2xl p-8 shadow-sm">
                <h2 className="text-xl font-semibold mb-6">Send a Message</h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+91 9876543210" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="organization" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization / Company</FormLabel>
                          <FormControl>
                            <Input placeholder="Your org name (if applicable)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="subject" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="What is this about?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SUBJECTS.map(s => (
                              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="message" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us how we can help, or describe your partnership proposal..."
                            className="min-h-[140px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <Button type="submit" disabled={isPending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      {isPending ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </Form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
