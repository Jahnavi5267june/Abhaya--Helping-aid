import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useCreateDonation, useListOrganizations } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useSearch } from "wouter";
import { Heart, Building, Loader2, Smartphone, CreditCard, Package, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DONATION_TYPES } from "@/lib/constants";

const UPI_ID = import.meta.env.VITE_UPI_ID || "abhaya@upi";

const donateSchema = z.object({
  donorName: z.string().min(2, "Name must be at least 2 characters"),
  donorEmail: z.string().email("Invalid email address"),
  donorPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  donorCity: z.string().optional(),
  donationType: z.enum(["money", "food", "clothes", "books", "medicines", "other"]),
  amount: z.coerce.number().min(1, "Amount must be greater than 0").optional().or(z.literal("")),
  description: z.string().optional(),
  organizationId: z.coerce.number().min(1, "Please select an organization"),
  paymentReference: z.string().optional(),
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
      paymentReference: "",
      organizationId: preselectedOrgId ? parseInt(preselectedOrgId) : undefined,
    },
  });

  const donationType = form.watch("donationType");
  const isMoneyDonation = donationType === "money";

  const onSubmit = (data: DonateFormValues) => {
    createDonation.mutate(
      {
        data: {
          ...data,
          amount: isMoneyDonation ? Number(data.amount) : undefined,
          paymentReference: isMoneyDonation ? data.paymentReference : undefined,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Donation Registered Successfully! 🎉",
            description: "Thank you for your generosity! The organization and admins have been notified.",
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

        {/* Payment Methods Banner */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex flex-wrap items-center gap-3">
          <span className="text-green-800 font-semibold text-sm">💳 Accepted Payment Methods:</span>
          <span className="flex items-center gap-1.5 text-sm bg-white border border-green-200 rounded-lg px-3 py-1.5">
            <Smartphone className="w-4 h-4 text-green-600" /> UPI
          </span>
          <span className="flex items-center gap-1.5 text-sm bg-white border border-green-200 rounded-lg px-3 py-1.5">
            <CreditCard className="w-4 h-4 text-blue-600" /> Net Banking
          </span>
          <span className="flex items-center gap-1.5 text-sm bg-white border border-green-200 rounded-lg px-3 py-1.5">
            <Package className="w-4 h-4 text-orange-600" /> In-Kind (Food, Books, Clothes)
          </span>
        </div>

        <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Organization */}
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
                              {org.name} — {org.district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Donation Details */}
              <div className="space-y-4 pt-2">
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

                  {isMoneyDonation && (
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (₹) *</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="500" {...field} />
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
                          placeholder={isMoneyDonation ? "Any specific purpose for this fund? (Optional)" : "Describe what you are donating (e.g., 50 blankets, 10kg rice, 20 school books)"}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* UPI Payment Instructions */}
              {isMoneyDonation && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <Smartphone className="w-6 h-6 text-amber-700 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-amber-900">How to Pay via UPI / Net Banking</p>
                      <p className="text-sm text-amber-800 mt-1">Please transfer the amount using any of the methods below, then enter your transaction reference below.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">UPI ID</p>
                      <p className="font-mono font-bold text-lg text-gray-800">{UPI_ID}</p>
                      <p className="text-xs text-gray-500 mt-1">Works on PhonePe, GPay, Paytm, BHIM</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Net Banking / NEFT</p>
                      <p className="text-sm text-gray-700">Contact admin at<br /><span className="font-semibold">dalipartijahnavi@gmail.com</span><br />for bank details</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-800">After payment, enter your UPI transaction ID / reference number below so admins can verify your donation.</p>
                  </div>
                  <FormField
                    control={form.control}
                    name="paymentReference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UPI Transaction ID / Reference No. (Optional but recommended)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 405812345678 or T2312345678" className="font-mono" {...field} />
                        </FormControl>
                        <FormDescription>Found in your payment app after completing the transfer.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Donor Details */}
              <div className="space-y-4 pt-2">
                <h3 className="font-semibold text-lg border-b pb-2">Your Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="donorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Full Name" {...field} />
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
                          <Input type="email" placeholder="you@example.com" {...field} />
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
                        <FormLabel>City / District</FormLabel>
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
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</>
                ) : (
                  "Confirm Donation ❤️"
                )}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                No account or login required. Your information is only used to coordinate with the organization.
              </p>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
