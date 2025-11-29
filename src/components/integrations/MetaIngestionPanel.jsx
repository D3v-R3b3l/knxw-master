import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Database, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { metaListPages } from "@/functions/metaListPages";
import { metaIngestPage } from "@/functions/metaIngestPage";

export default function MetaIngestionPanel() {
  const [loading, setLoading] = React.useState(false);
  const [pages, setPages] = React.useState([]);
  const [ingestingId, setIngestingId] = React.useState(null);
  const { toast } = useToast();

  const loadPages = async () => {
    setLoading(true);
    try {
      const { data } = await metaListPages();
      const list = Array.isArray(data?.pages) ? data.pages : Array.isArray(data) ? data : [];
      setPages(list);
      if (!Array.isArray(list) || list.length === 0) {
        toast({
          variant: "destructive",
          title: "No Pages found",
          description: "Connect a Meta account and ensure it has access to at least one Facebook Page."
        });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to load pages", description: e?.message || "Unknown error" });
    } finally {
      setLoading(false);
    }
  };

  const handleIngest = async (page_id) => {
    setIngestingId(page_id);
    try {
      const { data } = await metaIngestPage({ page_id, since_days: 14 });
      toast({
        variant: "success",
        title: `Synced ${data?.page?.name || "Page"}`,
        description: `Posts fetched: ${data?.summary?.posts_fetched || 0}, new: ${data?.summary?.posts_created || 0}, updated: ${data?.summary?.posts_updated || 0}, comments: ${data?.summary?.comments_created || 0}`
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Ingestion failed", description: e?.message || "Unknown error" });
    } finally {
      setIngestingId(null);
    }
  };

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader className="p-6">
        <CardTitle className="text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-[#00d4ff]" />
          Meta Page Data
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="flex items-center gap-3 mb-4">
          <Button onClick={loadPages} className="bg-[#0ea5e9] hover:bg-[#0284c7]">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Load My Pages
          </Button>
        </div>

        {pages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pages.map((p) => (
              <div key={p.id} className="p-4 rounded-lg bg-[#1a1a1a] border border-[#262626]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-white font-semibold">{p.name}</div>
                    {p.category && <div className="text-xs text-[#a3a3a3]">{p.category}</div>}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleIngest(p.id)}
                    disabled={ingestingId === p.id}
                    className="bg-[#10b981] hover:bg-[#059669]"
                  >
                    {ingestingId === p.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                    Ingest latest
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="text-[#a3a3a3] text-sm">
              No pages loaded yet. Click "Load My Pages" after connecting your Meta account.
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}