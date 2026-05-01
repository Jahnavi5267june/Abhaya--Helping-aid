import { useGetOrganization, useListDocuments } from "@workspace/api-client-react";
import { useRoute } from "wouter";
import { MapPin, Phone, Mail, Building, Users, Clock, Shield, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function OrganizationDetail() {
  const [, params] = useRoute("/organizations/:id");
  const id = params?.id ? parseInt(params.id) : 0;

  const { data: org, isLoading } = useGetOrganization(id, {
    query: { enabled: !!id, queryKey: [`/api/organizations/${id}`] }
  });

  const { data: documents, isLoading: docsLoading } = useListDocuments({ organizationId: id }, {
    query: { enabled: !!id, queryKey: [`/api/documents`, { organizationId: id }] }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-[400px] w-full rounded-2xl mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-3xl font-display font-bold mb-4">Organization Not Found</h1>
        <p className="text-muted-foreground mb-8">The organization you are looking for does not exist or has been removed.</p>
        <Button asChild>
          <Link href="/organizations">Back to Directory</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header / Hero */}
      <div className="w-full h-[400px] bg-muted relative">
        {org.imageUrl ? (
          <img src={org.imageUrl} alt={org.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10">
            <Building className="w-32 h-32 text-primary opacity-20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary text-primary-foreground text-sm font-semibold px-3 py-1 rounded-full capitalize">
                {org.type.replace('_', ' ')}
              </span>
              {org.verified && (
                <span className="bg-secondary text-secondary-foreground text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Shield className="w-4 h-4" /> Verified
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">{org.name}</h1>
            <div className="flex items-center gap-4 text-white/80">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {org.district}
              </div>
              {org.established && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Est. {org.established}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-display font-semibold mb-4">About the Organization</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {org.description || "No detailed description provided."}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-semibold mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" /> Transparency & Documents
              </h2>
              {docsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                </div>
              ) : documents?.length === 0 ? (
                <div className="bg-muted/30 border border-dashed rounded-xl p-8 text-center text-muted-foreground">
                  No documents have been uploaded for this organization yet.
                </div>
              ) : (
                <div className="grid gap-4">
                  {documents?.map(doc => (
                    <div key={doc.id} className="bg-card border rounded-xl p-4 flex items-center justify-between group hover:border-primary transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{doc.title}</h4>
                          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <span className="capitalize">{doc.category.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>{doc.year}</span>
                            {doc.verifiedBy && (
                              <>
                                <span>•</span>
                                <span className="text-secondary flex items-center gap-1">
                                  <Shield className="w-3 h-3" /> Verified by {doc.verifiedBy}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {doc.fileUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">View</a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-card border rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">Address</div>
                    <div className="text-sm text-muted-foreground">{org.address}</div>
                  </div>
                </div>
                {org.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">Phone</div>
                      <div className="text-sm text-muted-foreground">{org.phone}</div>
                    </div>
                  </div>
                )}
                {org.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-muted-foreground">{org.email}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {(org.capacity || org.currentOccupancy) && (
              <div className="bg-card border rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Capacity</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {org.currentOccupancy || 0} <span className="text-muted-foreground text-sm font-normal">/ {org.capacity || '?'}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">Current Occupancy</div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Support this Organization</h3>
              <p className="text-sm text-muted-foreground">Your contribution can make a real difference in the lives of those they support.</p>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg" asChild>
                <Link href={`/donate?orgId=${org.id}`}>Donate Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
