import { useGetStatsOverview, useListOrganizations, useListDisasterRelief } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowRight, Heart, Shield, Users, Activity, Building, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: stats, isLoading: statsLoading } = useGetStatsOverview();
  const { data: disasterRelief, isLoading: disasterLoading } = useListDisasterRelief({ status: "active" });
  const { data: organizations, isLoading: orgsLoading } = useListOrganizations({ type: "all" });

  const featuredOrgs = organizations?.slice(0, 3) || [];
  const activeDisaster = disasterRelief?.[0];

  return (
    <div className="flex flex-col w-full">
      {/* Active Disaster Banner */}
      {activeDisaster && (
        <div className="bg-destructive text-destructive-foreground px-4 py-3">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 animate-pulse" />
              <span className="font-semibold text-sm sm:text-base">
                Emergency Relief: {activeDisaster.title} ({activeDisaster.district})
              </span>
            </div>
            <Button asChild variant="outline" size="sm" className="bg-transparent border-destructive-foreground text-destructive-foreground hover:bg-destructive-foreground hover:text-destructive whitespace-nowrap">
              <Link href="/disaster">Contribute Now</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary/5 py-20 lg:py-32">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground leading-tight">
              A Digital Home for <br className="hidden sm:inline" />
              <span className="text-primary italic">Compassion</span> in Andhra Pradesh
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Connecting donors, verifiable organizations, and people in need. Building a trusted, transparent ecosystem for public welfare across all 26 districts.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/donate">Make a Donation</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-lg h-14 px-8">
                <Link href="/help">Request Assistance</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              icon={Building} 
              label="Verified Organizations" 
              value={stats?.verifiedOrganizations} 
              loading={statsLoading} 
            />
            <StatCard 
              icon={Users} 
              label="Total Donors" 
              value={stats?.totalDonors} 
              loading={statsLoading} 
            />
            <StatCard 
              icon={Heart} 
              label="Help Requests Resolved" 
              value={stats?.resolvedHelpRequests} 
              loading={statsLoading} 
            />
            <StatCard 
              icon={Shield} 
              label="Funds Raised (₹)" 
              value={stats?.totalFundsRaised?.toLocaleString('en-IN')} 
              loading={statsLoading} 
            />
          </div>
        </div>
      </section>

      {/* Featured Organizations */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-display font-bold text-foreground">Trusted Organizations</h2>
              <p className="text-muted-foreground mt-2">Verified partners making an impact on the ground.</p>
            </div>
            <Button asChild variant="ghost" className="group">
              <Link href="/organizations" className="flex items-center gap-2">
                View Directory
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {orgsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border rounded-xl p-6 space-y-4">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredOrgs.map((org) => (
                <Link key={org.id} href={`/organizations/${org.id}`} className="group block bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="aspect-video w-full bg-muted relative">
                    {org.imageUrl ? (
                      <img src={org.imageUrl} alt={org.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                        <Building className="w-12 h-12 opacity-50" />
                      </div>
                    )}
                    {org.verified && (
                      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur text-primary text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        Verified
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                      <span className="capitalize">{org.type.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{org.district}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                      {org.name}
                      <ArrowUpRight className="w-5 h-5 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, loading }: { icon: any, label: string, value: any, loading: boolean }) {
  return (
    <div className="bg-card border rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        {loading ? (
          <Skeleton className="h-8 w-24 mx-auto mb-2" />
        ) : (
          <div className="text-3xl font-bold text-foreground mb-1">{value || 0}</div>
        )}
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
