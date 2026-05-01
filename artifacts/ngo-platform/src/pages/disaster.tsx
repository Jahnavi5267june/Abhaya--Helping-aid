import { useState } from "react";
import { useListDisasterRelief, useContributeToDisasterRelief, ListDisasterReliefStatus } from "@workspace/api-client-react";
import { Activity, MapPin, Calendar, Phone, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const contributeSchema = z.object({
  donorName: z.string().min(2, "Name must be at least 2 characters"),
  donorPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  amount: z.coerce.number().min(10, "Amount must be at least ₹10"),
});

type ContributeFormValues = z.infer<typeof contributeSchema>;

export default function DisasterRelief() {
  const [status, setStatus] = useState<string>("active");
  const { data: campaigns, isLoading } = useListDisasterRelief({
    status: status !== "all" ? status as ListDisasterReliefStatus : undefined,
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center max-w-2xl mx-auto space-y-4">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
          <Activity className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-display font-bold">Disaster Relief</h1>
        <p className="text-lg text-muted-foreground">
          Immediate response campaigns for natural disasters and emergencies across Andhra Pradesh.
        </p>
      </div>

      <div className="flex justify-end mb-8">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Campaigns</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2].map(i => (
            <div key={i} className="bg-card border rounded-2xl overflow-hidden">
              <Skeleton className="h-64 w-full" />
              <div className="p-6 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full mt-6" />
              </div>
            </div>
          ))}
        </div>
      ) : campaigns?.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground mb-1">No campaigns found</h3>
          <p className="text-muted-foreground">There are no {status !== 'all' ? status : ''} disaster relief campaigns right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {campaigns?.map(campaign => (
            <div key={campaign.id} className="bg-card border rounded-2xl overflow-hidden flex flex-col group hover:shadow-lg transition-all">
              <div className="h-64 bg-muted relative">
                {campaign.imageUrl ? (
                  <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-destructive/5 text-destructive/40">
                    <AlertTriangle className="w-16 h-16" />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize shadow-sm backdrop-blur ${
                    campaign.status === 'active' ? 'bg-destructive text-destructive-foreground' :
                    campaign.status === 'closed' ? 'bg-muted text-muted-foreground' :
                    'bg-secondary text-secondary-foreground'
                  }`}>
                    {campaign.status}
                  </span>
                  <span className="bg-background/90 text-foreground text-xs font-bold px-3 py-1.5 rounded-full capitalize shadow-sm backdrop-blur">
                    Urgency: {campaign.urgencyLevel}
                  </span>
                </div>
              </div>
              
              <div className="p-6 md:p-8 flex flex-col flex-1">
                <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-md">
                    <MapPin className="w-4 h-4" /> {campaign.district}
                  </span>
                  {campaign.startDate && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" /> {new Date(campaign.startDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                <h3 className="text-2xl font-bold text-foreground mb-3">{campaign.title}</h3>
                <p className="text-muted-foreground mb-8 flex-1 leading-relaxed">
                  {campaign.description}
                </p>

                <div className="space-y-6 mt-auto">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-primary">Raised: ₹{campaign.raisedAmount.toLocaleString('en-IN')}</span>
                      <span className="text-muted-foreground">Goal: ₹{campaign.targetAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <Progress value={Math.min((campaign.raisedAmount / campaign.targetAmount) * 100, 100)} className="h-3" />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    {campaign.contactPhone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        {campaign.contactPhone}
                      </div>
                    )}
                    
                    {campaign.status === 'active' && (
                      <ContributeDialog campaignId={campaign.id} title={campaign.title} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContributeDialog({ campaignId, title }: { campaignId: number, title: string }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const contribute = useContributeToDisasterRelief();

  const form = useForm<ContributeFormValues>({
    resolver: zodResolver(contributeSchema),
    defaultValues: {
      donorName: "",
      donorPhone: "",
      amount: "",
    },
  });

  const onSubmit = (data: ContributeFormValues) => {
    contribute.mutate(
      { id: campaignId, data },
      {
        onSuccess: () => {
          toast({
            title: "Contribution Successful",
            description: "Thank you for supporting this relief campaign.",
          });
          queryClient.invalidateQueries({ queryKey: [`/api/disaster-relief`] });
          setOpen(false);
          form.reset();
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || "Failed to process contribution.",
            variant: "destructive",
          });
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
          Contribute Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contribute to Relief Fund</DialogTitle>
          <DialogDescription>
            You are contributing to: {title}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="donorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} />
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
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="Mobile Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full mt-4" disabled={contribute.isPending}>
              {contribute.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                "Confirm Contribution"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}