import { useState } from "react";
import { useListCommunityAlerts, useCreateCommunityAlert } from "@workspace/api-client-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Bell, Plus, MapPin, Clock, AlertTriangle, CheckCircle,
  Filter, Loader2, X, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AP_DISTRICTS, COMMUNITY_ALERT_CATEGORIES, URGENCY_LEVELS } from "@/lib/constants";

const alertSchema = z.object({
  title: z.string().min(5, "Please provide a brief title"),
  description: z.string().min(10, "Please describe the situation in detail"),
  category: z.enum(["hunger", "medical", "blood", "clothes", "books", "elderly", "child", "other"]),
  location: z.string().min(3, "Please provide a specific location"),
  district: z.string().min(1, "Please select a district"),
  urgency: z.enum(["low", "medium", "high", "critical"]),
  reporterName: z.string().min(2, "Your name is required"),
  reporterPhone: z.string().min(10, "Phone number is required"),
  reporterEmail: z.string().email("Invalid email").optional().or(z.literal("")),
});

type AlertFormValues = z.infer<typeof alertSchema>;

const CATEGORY_META: Record<string, { icon: string; color: string; bg: string; border: string }> = {
  hunger:  { icon: "🍛", color: "text-orange-700", bg: "bg-orange-50",  border: "border-orange-200" },
  medical: { icon: "🏥", color: "text-red-700",    bg: "bg-red-50",     border: "border-red-200" },
  blood:   { icon: "🩸", color: "text-red-800",    bg: "bg-red-50",     border: "border-red-300" },
  clothes: { icon: "👕", color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200" },
  books:   { icon: "📚", color: "text-green-700",  bg: "bg-green-50",   border: "border-green-200" },
  elderly: { icon: "👴", color: "text-purple-700", bg: "bg-purple-50",  border: "border-purple-200" },
  child:   { icon: "👶", color: "text-pink-700",   bg: "bg-pink-50",    border: "border-pink-200" },
  other:   { icon: "🆘", color: "text-gray-700",   bg: "bg-gray-50",    border: "border-gray-200" },
};

const URGENCY_COLORS: Record<string, string> = {
  critical: "bg-red-600 text-white",
  high:     "bg-orange-500 text-white",
  medium:   "bg-yellow-500 text-white",
  low:      "bg-green-500 text-white",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Community() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const { data: alerts, isLoading, refetch } = useListCommunityAlerts({
    status: "open",
    ...(filterDistrict ? { district: filterDistrict } : {}),
    ...(filterCategory ? { category: filterCategory } : {}),
  });

  const createAlert = useCreateCommunityAlert();

  const form = useForm<AlertFormValues>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      title: "", description: "", category: "hunger",
      location: "", district: "", urgency: "high",
      reporterName: "", reporterPhone: "", reporterEmail: "",
    },
  });

  const onSubmit = (data: AlertFormValues) => {
    createAlert.mutate(
      { data },
      {
        onSuccess: () => {
          toast({ title: "Alert Raised! 🆘", description: "Your alert has been posted and admins notified. The community can now see and help." });
          form.reset();
          setShowForm(false);
          refetch();
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err.message || "Failed to post alert.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-display font-bold text-foreground mb-3">Community Help Board</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          See someone starving? Someone who needs blood urgently? Post an alert. Anyone in your area can help —
          food, clothes, books, blood, medical aid. No login needed.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => setShowForm(!showForm)} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white h-12 px-6">
            {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Bell className="w-4 h-4" /> Raise an Alert</>}
          </Button>
          <Button variant="outline" className="gap-2 h-12 px-6" onClick={() => setShowForm(true)}>
            <Heart className="w-4 h-4 text-red-500" /> Request Help for Someone
          </Button>
        </div>
      </div>

      {/* Category Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        <button
          onClick={() => setFilterCategory("")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${filterCategory === "" ? "bg-purple-600 text-white border-purple-600" : "bg-white border-gray-200 hover:border-purple-300"}`}
        >
          All Alerts
        </button>
        {COMMUNITY_ALERT_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilterCategory(filterCategory === cat.value ? "" : cat.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5 ${filterCategory === cat.value ? "bg-purple-600 text-white border-purple-600" : "bg-white border-gray-200 hover:border-purple-300"}`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Post Alert Form */}
      {showForm && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-bold text-purple-900 mb-1 flex items-center gap-2">
            <Bell className="w-5 h-5" /> Post a Community Alert
          </h2>
          <p className="text-sm text-purple-700 mb-5">
            Seen someone in need? Report it here. No login required. Admins and nearby community members will see this instantly.
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Need *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {COMMUNITY_ALERT_CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.icon} {c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="urgency" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urgency *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {URGENCY_LEVELS.map((u) => (
                          <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Brief Title *</FormLabel>
                  <FormControl><Input placeholder="e.g. Elderly man needs food near Railway Station" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Describe the Situation *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Provide as much detail as possible — what they need, how many people, any other observations..." className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="district" render={({ field }) => (
                  <FormItem>
                    <FormLabel>District *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {AP_DISTRICTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specific Location *</FormLabel>
                    <FormControl><Input placeholder="Street, Landmark, Area" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Your Contact (for coordination)</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="reporterName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name *</FormLabel>
                      <FormControl><Input placeholder="Your name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="reporterPhone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl><Input type="tel" placeholder="Mobile" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="reporterEmail" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl><Input type="email" placeholder="Optional" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white text-base" disabled={createAlert.isPending}>
                {createAlert.isPending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Posting Alert...</> : "🆘 Post Alert Now"}
              </Button>
            </form>
          </Form>
        </div>
      )}

      {/* District Filter */}
      <div className="flex items-center gap-3 mb-6">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Filter by District:</span>
        <Select value={filterDistrict || "all"} onValueChange={(v) => setFilterDistrict(v === "all" ? "" : v)}>
          <SelectTrigger className="w-48 h-9">
            <SelectValue placeholder="All Districts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            {AP_DISTRICTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        {(filterDistrict || filterCategory) && (
          <Button variant="ghost" size="sm" onClick={() => { setFilterDistrict(""); setFilterCategory(""); }}>
            <X className="w-4 h-4 mr-1" /> Clear Filters
          </Button>
        )}
      </div>

      {/* Alerts List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : alerts && alerts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alert) => {
            const meta = CATEGORY_META[alert.category] || CATEGORY_META.other;
            return (
              <div key={alert.id} className={`rounded-xl border-2 ${meta.border} ${meta.bg} p-5 space-y-3`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{meta.icon}</span>
                    <div>
                      <h3 className={`font-semibold text-base ${meta.color}`}>{alert.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge className={`text-xs ${URGENCY_COLORS[alert.urgency] || "bg-gray-400 text-white"}`}>
                          {alert.urgency === "critical" ? "🚨 " : ""}{alert.urgency.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground capitalize">
                          {COMMUNITY_ALERT_CATEGORIES.find(c => c.value === alert.category)?.label || alert.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {timeAgo(alert.createdAt)}
                  </span>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed">{alert.description}</p>

                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{alert.location}, {alert.district}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-current/10">
                  <span className="text-xs text-muted-foreground">
                    Reported by {alert.reporterName}
                  </span>
                  <a
                    href={`tel:${alert.reporterPhone}`}
                    className="text-xs bg-white border px-3 py-1.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    📞 Call to Help
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 space-y-3">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
          <p className="text-xl font-semibold text-foreground">No open alerts right now</p>
          <p className="text-muted-foreground">
            {filterDistrict || filterCategory
              ? "No alerts match your filters. Try clearing them."
              : "Great news! No one has raised an alert in your area. If you see someone in need, post an alert above."}
          </p>
        </div>
      )}

      {/* How It Works */}
      <div className="mt-16 bg-muted/40 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-8">How the Community Board Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "👁️", title: "See Someone in Need", desc: "A beggar starving, a child without clothes, an elderly person abandoned — anything you witness." },
            { icon: "📢", title: "Post an Alert", desc: "Click 'Raise an Alert', describe the situation with location. No login needed. Takes 2 minutes." },
            { icon: "🤝", title: "Community Responds", desc: "Nearby donors, volunteers, and organizations see your alert and can help directly. Admins are notified instantly." },
          ].map((step, i) => (
            <div key={i} className="text-center space-y-3">
              <div className="text-4xl">{step.icon}</div>
              <h3 className="font-semibold text-lg">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
