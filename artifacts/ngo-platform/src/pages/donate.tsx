import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useCreateDonation, useListOrganizations } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useSearch } from "wouter";
import { Heart, Building, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DONATION_TYPES } from "@/lib/constants";

const donateSchema = z.object({
  donorName: z.string().min(2, "Name must be at least 2 characters"),
  donorEmail: z.string().email("Invalid email address"),
  donorPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  donorCity: z.string().optional(),
  donationType: z.enum(["money", "food", "clothes", "other"]),
  amount: z.coerce.number().min(1, "Amount must be greater than 0").optional().or(z.literal("")),
  description: z.string().optional(),
  organizationId: z.coerce.number().min(1, "Please select an organization"),
});

type DonateFormValues = z.infer<typeof donateSchema>;

export default function Donate() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const preselectedOrgId = searchParams.get("orgId");

  const { data: organizations, isLoading: orgsLoading } = useListOrganizations({ type: "all" });
  const createDonation = useCreateDonation();

  const form = useForm<DonateFormValues>({
    resolver: zodResolver(donateSchema),
    defaultValues: {
      donorName: "",
      donorEmail: "",
      donorPhone: "",
      donorCity: "",
      donationType: "money",
      amount: "",
      description: "",
      organizationId: preselectedOrgId ? parseInt(preselectedOrgId) : undefined,
    },
  });

  const donationType = form.watch("donationType");

  const onSubmit = (data: DonateFormValues) => {
    createDonation.mutate(
      {
        data: {
          ...data,
          amount: data.donationType === "money" ? Number(data.amount) : undefined,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Donation Registered Successfully",
            description: "Thank you for your generosity! The organization will be notified.",
          });
          setLocation("/");
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || "Failed to register donation. Please try again.",
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
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-4">Make a Contribution</h1>
          <p className="text-muted-foreground text-lg">
            Your generosity helps organizations across Andhra Pradesh provide better care for those in need.
          </p>
        </div>

        <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                  <Building className="w-5 h-5 text-primary" /> Recipient Organization
                </h3>
                <FormField
                  control={form.control}
                  name="organizationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Organization *</FormLabel>
                      <Select 
                        onValueChange={(val) => field.onChange(parseInt(val))} 
                        value={field.value?.toString()}
                        disabled={orgsLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={orgsLoading ? "Loading..." : "Select an organization to support"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {organizations?.map((org) => (
                            <SelectItem key={org.id} value={org.id.toString()}>
                              {org.name} ({org.district})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                  <Heart className="w-5 h-5 text-primary" /> Donation Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="donationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What would you like to donate? *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DONATION_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {donationType === "money" && (
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (₹) *</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="1000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description / Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={donationType === "money" ? "Any specific purpose for this fund?" : "Please describe what you are donating (e.g., 50 blankets, 10kg rice)"} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 border-b pb-2">
                  Your Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="donorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="donorEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="donorPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+91 9876543210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="donorCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Visakhapatnam" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full text-lg h-12" disabled={createDonation.isPending}>
                {createDonation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...
                  </>
                ) : (
                  "Confirm Donation"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
