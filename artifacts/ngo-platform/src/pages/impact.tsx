import { useGetStatsOverview, useGetDonationsByType } from "@workspace/api-client-react";
import { BarChart3, TrendingUp, Users, Heart, Activity } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function Impact() {
  const { data: stats, isLoading: statsLoading } = useGetStatsOverview();
  const { data: donationTypes, isLoading: typesLoading } = useGetDonationsByType();

  const COLORS = ['#C05832', '#3D5A40', '#F2A900', '#2E5077', '#A0522D'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-md">
          <p className="font-medium text-foreground capitalize">{payload[0].name || label}</p>
          <p className="text-primary font-bold">
            {payload[0].value} {payload[0].payload?.percentage ? `(${payload[0].payload.percentage}%)` : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center max-w-2xl mx-auto space-y-4">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-display font-bold">Our Impact</h1>
        <p className="text-lg text-muted-foreground">
          See the real-time difference we are making together across Andhra Pradesh.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-card border rounded-2xl p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {statsLoading ? <Skeleton className="h-8 w-24" /> : `₹${stats?.totalFundsRaised?.toLocaleString('en-IN') || 0}`}
              </div>
              <div className="text-sm font-medium text-muted-foreground">Total Funds Raised</div>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-secondary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.totalDonors || 0}
              </div>
              <div className="text-sm font-medium text-muted-foreground">Generous Donors</div>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-accent/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.resolvedHelpRequests || 0}
              </div>
              <div className="text-sm font-medium text-muted-foreground">Help Requests Resolved</div>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-destructive/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.activeDisasterCampaigns || 0}
              </div>
              <div className="text-sm font-medium text-muted-foreground">Active Relief Campaigns</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-foreground mb-6">Donations by Category</h2>
          {typesLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <Skeleton className="w-64 h-64 rounded-full" />
            </div>
          ) : !donationTypes?.length ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No donation data available yet.
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donationTypes.map(d => ({ ...d, name: d.type.replace('_', ' ') }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {donationTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="capitalize">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-foreground mb-6">Activity Overview</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <span className="text-muted-foreground">Total Verified Organizations</span>
              <span className="font-bold text-lg">{stats?.verifiedOrganizations || 0} / {stats?.totalOrganizations || 0}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-4">
              <span className="text-muted-foreground">Total Help Requests</span>
              <span className="font-bold text-lg">{stats?.totalHelpRequests || 0}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-4">
              <span className="text-muted-foreground">Total Donations Made</span>
              <span className="font-bold text-lg">{stats?.totalDonations || 0}</span>
            </div>
          </div>
          <div className="mt-8 p-4 bg-muted/30 rounded-xl border border-dashed text-sm text-center text-muted-foreground">
            These statistics represent the collective effort of all Sahaya Andhra users and partner organizations. Data is updated in real-time.
          </div>
        </div>
      </div>
    </div>
  );
}
