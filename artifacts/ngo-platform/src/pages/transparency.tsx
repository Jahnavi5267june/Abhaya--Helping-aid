import { useState } from "react";
import { useListDocuments, ListDocumentsCategory, useListOrganizations } from "@workspace/api-client-react";
import { Shield, Search, FileText, Building, Calendar, Award } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DOCUMENT_CATEGORIES } from "@/lib/constants";

export default function Transparency() {
  const [categoryId, setCategoryId] = useState<string>("all");
  const [orgId, setOrgId] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: organizations, isLoading: orgsLoading } = useListOrganizations({ type: "all" });
  
  const { data: documents, isLoading: docsLoading } = useListDocuments({
    category: categoryId !== "all" ? categoryId as ListDocumentsCategory : undefined,
    organizationId: orgId !== "all" ? parseInt(orgId) : undefined,
  });

  const filteredDocs = documents?.filter(doc => 
    doc.title.toLowerCase().includes(search.toLowerCase()) || 
    doc.organizationName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center max-w-2xl mx-auto space-y-4">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-display font-bold">Transparency Hub</h1>
        <p className="text-lg text-muted-foreground">
          We believe in complete transparency. Access audit reports, utilization certificates, and registration documents for all verified partner organizations.
        </p>
      </div>

      <div className="bg-card border rounded-xl p-4 mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Search documents..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={orgId} onValueChange={setOrgId} disabled={orgsLoading}>
          <SelectTrigger className="w-full md:w-[250px]">
            <SelectValue placeholder="Organization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Organizations</SelectItem>
            {organizations?.map(org => (
              <SelectItem key={org.id} value={org.id.toString()}>{org.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-full md:w-[250px]">
            <SelectValue placeholder="Document Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Document Types</SelectItem>
            {DOCUMENT_CATEGORIES.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {docsLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredDocs?.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground mb-1">No documents found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredDocs?.map(doc => (
            <div key={doc.id} className="bg-card border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-primary/50 transition-colors">
              <div className="flex items-start md:items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                    {doc.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Building className="w-4 h-4" />
                      {doc.organizationName}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {doc.year}
                    </div>
                    <div className="flex items-center gap-1.5 text-primary">
                      <span className="capitalize bg-primary/10 px-2 py-0.5 rounded-md">
                        {doc.category.replace('_', ' ')}
                      </span>
                    </div>
                    {doc.verifiedBy && (
                      <div className="flex items-center gap-1.5 text-secondary font-medium">
                        <Award className="w-4 h-4" />
                        Verified by {doc.verifiedBy}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="md:ml-auto">
                <Button variant="outline" asChild className="w-full md:w-auto">
                  <a href={doc.fileUrl || "#"} target="_blank" rel="noopener noreferrer">
                    View Document
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
