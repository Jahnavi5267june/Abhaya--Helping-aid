import { useState } from "react";
import { useListOrganizations, ListOrganizationsType } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Building, MapPin, Users, Shield, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AP_DISTRICTS, ORG_TYPES } from "@/lib/constants";

export default function Organizations() {
  const [district, setDistrict] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: organizations, isLoading } = useListOrganizations({
    type: type !== "all" ? type as ListOrganizationsType : undefined,
    district: district !== "all" ? district : undefined,
  });

  const filteredOrgs = organizations?.filter(org => 
    org.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl font-display font-bold">Partner Organizations</h1>
        <p className="text-lg text-muted-foreground">
          Discover verified old age homes and orphanages across Andhra Pradesh making a difference.
        </p>
      </div>

      <div className="bg-card border rounded-xl p-4 mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Search organizations..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={district} onValueChange={setDistrict}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="District" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            {AP_DISTRICTS.map(d => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {ORG_TYPES.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-card border rounded-xl p-6 space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredOrgs?.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground mb-1">No organizations found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrgs?.map(org => (
            <Link key={org.id} href={`/organizations/${org.id}`} className="group bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all flex flex-col">
              <div className="aspect-video w-full bg-muted relative">
                {org.imageUrl ? (
                  <img src={org.imageUrl} alt={org.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                    <Building className="w-12 h-12 opacity-50" />
                  </div>
                )}
                {org.verified && (
                  <div className="absolute top-4 right-4 bg-background/90 backdrop-blur text-primary text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <Shield className="w-3.5 h-3.5" />
                    Verified
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3">
                  <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md capitalize">
                    {org.type.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {org.name}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
                  {org.description || "No description provided."}
                </p>
                <div className="space-y-2 mt-auto pt-4 border-t border-border/50 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{org.district}</span>
                  </div>
                  {org.capacity && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4 text-primary" />
                      <span>Capacity: {org.currentOccupancy || 0} / {org.capacity}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
