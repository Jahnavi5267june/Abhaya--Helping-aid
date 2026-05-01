import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Shield, LogOut, Building2, HandHeart, HelpCircle, FileText, Siren, LayoutDashboard, CheckCircle, XCircle, Clock, AlertTriangle, Trash2, ShieldCheck, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  useListOrganizations, getListOrganizationsQueryKey,
  useListDonations, getListDonationsQueryKey,
  useListHelpRequests, getListHelpRequestsQueryKey,
  useListDocuments, getListDocumentsQueryKey,
  useListDisasterRelief, getListDisasterReliefQueryKey,
  useGetStatsOverview, getGetStatsOverviewQueryKey,
} from "@workspace/api-client-react";
import {
  adminLogin, saveToken, clearToken, isLoggedIn,
  patchOrganization, deleteOrganization,
  patchDonation, deleteDonation,
  patchHelpRequest, deleteHelpRequest,
  patchDisasterRelief, deleteDocument,
} from "@/lib/admin-api";

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = await adminLogin(password);
      saveToken(token);
      onLogin();
    } catch {
      setError("Invalid password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-3">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Abhaya Admin</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Enter your admin password to continue</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-admin-password"
                autoFocus
              />
              {error && <p className="text-destructive text-xs mt-1">{error}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading} data-testid="button-admin-login">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: any; color: string }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function urgencyColor(u: string) {
  if (u === "critical") return "destructive";
  if (u === "high") return "secondary";
  return "outline";
}

function statusBadge(s: string) {
  if (s === "resolved" || s === "delivered" || s === "confirmed") return <Badge className="bg-green-100 text-green-800 border-green-200">{s}</Badge>;
  if (s === "in_progress") return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{s}</Badge>;
  if (s === "pending") return <Badge variant="outline">{s}</Badge>;
  if (s === "active") return <Badge className="bg-orange-100 text-orange-800 border-orange-200">{s}</Badge>;
  if (s === "closed") return <Badge variant="secondary">{s}</Badge>;
  return <Badge variant="outline">{s}</Badge>;
}

export default function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [activeTab, setActiveTab] = useState("overview");
  const qc = useQueryClient();
  const { toast } = useToast();

  function logout() {
    clearToken();
    setLoggedIn(false);
  }

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-primary">Abhaya</span>
              <span className="ml-2 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Admin Panel</span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={logout} data-testid="button-admin-logout">
            <LogOut className="w-4 h-4 mr-1" /> Sign Out
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" data-testid="tab-overview"><LayoutDashboard className="w-4 h-4 mr-1" />Overview</TabsTrigger>
            <TabsTrigger value="organizations" data-testid="tab-organizations"><Building2 className="w-4 h-4 mr-1" />Organizations</TabsTrigger>
            <TabsTrigger value="donations" data-testid="tab-donations"><HandHeart className="w-4 h-4 mr-1" />Donations</TabsTrigger>
            <TabsTrigger value="help-requests" data-testid="tab-help-requests"><HelpCircle className="w-4 h-4 mr-1" />Help Requests</TabsTrigger>
            <TabsTrigger value="documents" data-testid="tab-documents"><FileText className="w-4 h-4 mr-1" />Documents</TabsTrigger>
            <TabsTrigger value="disaster" data-testid="tab-disaster"><Siren className="w-4 h-4 mr-1" />Disaster Relief</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>

          {/* ORGANIZATIONS */}
          <TabsContent value="organizations">
            <OrganizationsTab qc={qc} toast={toast} />
          </TabsContent>

          {/* DONATIONS */}
          <TabsContent value="donations">
            <DonationsTab qc={qc} toast={toast} />
          </TabsContent>

          {/* HELP REQUESTS */}
          <TabsContent value="help-requests">
            <HelpRequestsTab qc={qc} toast={toast} />
          </TabsContent>

          {/* DOCUMENTS */}
          <TabsContent value="documents">
            <DocumentsTab qc={qc} toast={toast} />
          </TabsContent>

          {/* DISASTER RELIEF */}
          <TabsContent value="disaster">
            <DisasterTab qc={qc} toast={toast} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function OverviewTab() {
  const stats = useGetStatsOverview({ query: { queryKey: getGetStatsOverviewQueryKey() } });
  const s = stats.data;
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Platform Overview</h2>
        <p className="text-sm text-muted-foreground">Live data from the Abhaya NGO platform</p>
      </div>
      {stats.isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Organizations" value={s?.totalOrganizations ?? 0} icon={Building2} color="bg-primary/10 text-primary" />
          <StatCard label="Verified Orgs" value={s?.verifiedOrganizations ?? 0} icon={CheckCircle} color="bg-green-100 text-green-700" />
          <StatCard label="Total Donors" value={s?.totalDonors ?? 0} icon={HandHeart} color="bg-orange-100 text-orange-700" />
          <StatCard label="Donations" value={s?.totalDonations ?? 0} icon={HandHeart} color="bg-amber-100 text-amber-700" />
          <StatCard label="Help Requests" value={s?.totalHelpRequests ?? 0} icon={HelpCircle} color="bg-blue-100 text-blue-700" />
          <StatCard label="Resolved" value={s?.resolvedHelpRequests ?? 0} icon={CheckCircle} color="bg-teal-100 text-teal-700" />
          <StatCard label="Active Campaigns" value={s?.activeDisasterCampaigns ?? 0} icon={Siren} color="bg-red-100 text-red-700" />
          <StatCard label="Funds Raised" value={`₹${((s?.totalFundsRaised ?? 0) / 100000).toFixed(1)}L`} icon={HandHeart} color="bg-purple-100 text-purple-700" />
        </div>
      )}
    </div>
  );
}

function OrganizationsTab({ qc, toast }: any) {
  const { data: orgs, isLoading } = useListOrganizations({ type: "all" }, { query: { queryKey: getListOrganizationsQueryKey({ type: "all" }) } });

  async function toggleVerify(id: number, current: boolean) {
    try {
      await patchOrganization(id, { verified: !current });
      qc.invalidateQueries({ queryKey: getListOrganizationsQueryKey({ type: "all" }) });
      qc.invalidateQueries({ queryKey: getGetStatsOverviewQueryKey() });
      toast({ title: current ? "Organization unverified" : "Organization verified" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this organization? This cannot be undone.")) return;
    try {
      await deleteOrganization(id);
      qc.invalidateQueries({ queryKey: getListOrganizationsQueryKey({ type: "all" }) });
      toast({ title: "Organization deleted" });
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Organizations <span className="text-sm font-normal text-muted-foreground">({orgs?.length ?? 0})</span></h2>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>District</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Occupancy</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
              ))
            ) : orgs?.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No organizations</TableCell></TableRow>
            ) : orgs?.map((org) => (
              <TableRow key={org.id} data-testid={`row-org-${org.id}`}>
                <TableCell className="font-medium">{org.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs capitalize">{org.type?.replace("_", " ")}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{org.district}</TableCell>
                <TableCell className="text-sm">{org.capacity ?? "—"}</TableCell>
                <TableCell className="text-sm">{org.currentOccupancy ?? "—"}</TableCell>
                <TableCell>
                  {org.verified
                    ? <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Verified</Badge>
                    : <Badge variant="outline" className="text-xs">Unverified</Badge>
                  }
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      title={org.verified ? "Remove verification" : "Mark as verified"}
                      onClick={() => toggleVerify(org.id, org.verified ?? false)}
                      data-testid={`button-verify-org-${org.id}`}
                    >
                      {org.verified ? <ShieldOff className="w-4 h-4 text-muted-foreground" /> : <ShieldCheck className="w-4 h-4 text-primary" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(org.id)}
                      data-testid={`button-delete-org-${org.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function DonationsTab({ qc, toast }: any) {
  const { data: donations, isLoading } = useListDonations(undefined, { query: { queryKey: getListDonationsQueryKey() } });

  async function changeStatus(id: number, status: string) {
    try {
      await patchDonation(id, status);
      qc.invalidateQueries({ queryKey: getListDonationsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetStatsOverviewQueryKey() });
      toast({ title: `Status updated to ${status}` });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this donation record?")) return;
    try {
      await deleteDonation(id);
      qc.invalidateQueries({ queryKey: getListDonationsQueryKey() });
      toast({ title: "Donation deleted" });
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Donations <span className="text-sm font-normal text-muted-foreground">({donations?.length ?? 0})</span></h2>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Donor</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12">Del</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
              ))
            ) : donations?.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No donations yet</TableCell></TableRow>
            ) : donations?.map((d) => (
              <TableRow key={d.id} data-testid={`row-donation-${d.id}`}>
                <TableCell>
                  <div className="font-medium text-sm">{d.donorName}</div>
                  <div className="text-xs text-muted-foreground">{d.donorPhone}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs capitalize">{d.donationType}</Badge>
                </TableCell>
                <TableCell className="text-sm">{d.amount ? `₹${d.amount.toLocaleString()}` : "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{d.organizationName || `Org #${d.organizationId}`}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(d.createdAt).toLocaleDateString("en-IN")}</TableCell>
                <TableCell>
                  <Select value={d.status} onValueChange={(v) => changeStatus(d.id, v)}>
                    <SelectTrigger className="h-7 text-xs w-28" data-testid={`select-donation-status-${d.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(d.id)} data-testid={`button-delete-donation-${d.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function HelpRequestsTab({ qc, toast }: any) {
  const { data: requests, isLoading } = useListHelpRequests(undefined, { query: { queryKey: getListHelpRequestsQueryKey() } });

  async function changeStatus(id: number, status: string) {
    try {
      await patchHelpRequest(id, status);
      qc.invalidateQueries({ queryKey: getListHelpRequestsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetStatsOverviewQueryKey() });
      toast({ title: `Status updated to ${status}` });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this help request?")) return;
    try {
      await deleteHelpRequest(id);
      qc.invalidateQueries({ queryKey: getListHelpRequestsQueryKey() });
      toast({ title: "Help request deleted" });
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  }

  const urgencyIcon = (u: string) => {
    if (u === "critical") return <AlertTriangle className="w-3 h-3 text-destructive" />;
    if (u === "high") return <AlertTriangle className="w-3 h-3 text-orange-500" />;
    if (u === "medium") return <Clock className="w-3 h-3 text-amber-500" />;
    return <Clock className="w-3 h-3 text-muted-foreground" />;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Help Requests <span className="text-sm font-normal text-muted-foreground">({requests?.length ?? 0})</span></h2>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Requester</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12">Del</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
              ))
            ) : requests?.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No help requests yet</TableCell></TableRow>
            ) : requests?.map((r) => (
              <TableRow key={r.id} data-testid={`row-help-${r.id}`}>
                <TableCell>
                  <div className="font-medium text-sm">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.phone}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs capitalize">{r.category?.replace("_", " ")}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.district || r.location}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {urgencyIcon(r.urgency ?? "")}
                    <span className="text-xs capitalize">{r.urgency}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-40 truncate">{r.description}</TableCell>
                <TableCell>
                  <Select value={r.status} onValueChange={(v) => changeStatus(r.id, v)}>
                    <SelectTrigger className="h-7 text-xs w-28" data-testid={`select-help-status-${r.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(r.id)} data-testid={`button-delete-help-${r.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function DocumentsTab({ qc, toast }: any) {
  const { data: docs, isLoading } = useListDocuments(undefined, { query: { queryKey: getListDocumentsQueryKey() } });

  async function handleDelete(id: number) {
    if (!confirm("Delete this document?")) return;
    try {
      await deleteDocument(id);
      qc.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
      toast({ title: "Document deleted" });
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  }

  const categoryLabel: Record<string, string> = {
    audit_report: "Audit Report",
    utilization_certificate: "Utilization Cert.",
    registration: "Registration",
    annual_report: "Annual Report",
    donation_receipt: "Donation Receipt",
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Transparency Documents <span className="text-sm font-normal text-muted-foreground">({docs?.length ?? 0})</span></h2>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Verified By</TableHead>
              <TableHead>File</TableHead>
              <TableHead className="w-12">Del</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
              ))
            ) : docs?.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No documents uploaded</TableCell></TableRow>
            ) : docs?.map((d) => (
              <TableRow key={d.id} data-testid={`row-doc-${d.id}`}>
                <TableCell className="font-medium text-sm">{d.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{categoryLabel[d.category ?? ""] || d.category}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{d.organizationName || `Org #${d.organizationId}`}</TableCell>
                <TableCell className="text-sm">{d.year}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{d.verifiedBy || "—"}</TableCell>
                <TableCell>
                  {d.fileUrl ? (
                    <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">View</a>
                  ) : <span className="text-xs text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(d.id)} data-testid={`button-delete-doc-${d.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function DisasterTab({ qc, toast }: any) {
  const { data: campaigns, isLoading } = useListDisasterRelief(undefined, { query: { queryKey: getListDisasterReliefQueryKey() } });

  async function changeStatus(id: number, status: string) {
    try {
      await patchDisasterRelief(id, { status });
      qc.invalidateQueries({ queryKey: getListDisasterReliefQueryKey() });
      qc.invalidateQueries({ queryKey: getGetStatsOverviewQueryKey() });
      toast({ title: `Campaign status updated to ${status}` });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Disaster Relief Campaigns <span className="text-sm font-normal text-muted-foreground">({campaigns?.length ?? 0})</span></h2>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>District</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Raised</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
              ))
            ) : campaigns?.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No campaigns</TableCell></TableRow>
            ) : campaigns?.map((c) => {
              const pct = c.targetAmount > 0 ? Math.min(100, Math.round((c.raisedAmount / c.targetAmount) * 100)) : 0;
              return (
                <TableRow key={c.id} data-testid={`row-disaster-${c.id}`}>
                  <TableCell className="font-medium text-sm max-w-36 truncate">{c.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.district}</TableCell>
                  <TableCell className="text-sm">₹{(c.targetAmount / 100000).toFixed(1)}L</TableCell>
                  <TableCell className="text-sm">₹{(c.raisedAmount / 100000).toFixed(1)}L</TableCell>
                  <TableCell>
                    <div className="w-24">
                      <div className="flex justify-between text-xs mb-1"><span>{pct}%</span></div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={urgencyColor(c.urgencyLevel ?? "") as any} className="text-xs capitalize">{c.urgencyLevel}</Badge>
                  </TableCell>
                  <TableCell>
                    <Select value={c.status} onValueChange={(v) => changeStatus(c.id, v)}>
                      <SelectTrigger className="h-7 text-xs w-28" data-testid={`select-disaster-status-${c.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
