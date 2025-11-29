import React from "react";
import { MetaPage } from "@/entities/MetaPage";
import { MetaPageAnalysis } from "@/entities/MetaPageAnalysis";
import { analyzeMetaPage } from "@/functions/analyzeMetaPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Brain, RefreshCw } from "lucide-react";

export default function MetaAnalysisPanel() {
  const [pages, setPages] = React.useState([]);
  const [selectedPage, setSelectedPage] = React.useState("");
  const [sinceDays, setSinceDays] = React.useState(14);
  const [isRunning, setIsRunning] = React.useState(false);
  const [latestAnalysis, setLatestAnalysis] = React.useState(null);

  React.useEffect(() => {
    const load = async () => {
      const list = await MetaPage.list("-last_synced", 50);
      setPages(Array.isArray(list) ? list : []);
    };
    load();
  }, []);

  const run = async () => {
    if (!selectedPage) return;
    setIsRunning(true);
    const { data } = await analyzeMetaPage({ page_id: selectedPage, since_days: sinceDays });
    setIsRunning(false);
    if (data?.analysis) setLatestAnalysis(data.analysis);
  };

  // Wrapped in useCallback to satisfy exhaustive-deps and avoid re-creation
  const loadLatest = React.useCallback(async () => {
    if (!selectedPage) return;
    const rows = await MetaPageAnalysis.filter({ fb_page_id: selectedPage }, "-computed_at", 1);
    setLatestAnalysis(rows?.[0] || null);
  }, [selectedPage]);

  React.useEffect(() => {
    if (selectedPage) loadLatest();
  }, [selectedPage, loadLatest]);

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader className="p-6">
        <CardTitle className="flex items-center gap-2 text-white">
          <Brain className="w-5 h-5 text-[#00d4ff]" />
          Psychographic Analysis (Meta Page)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <Select value={selectedPage} onValueChange={setSelectedPage}>
            <SelectTrigger className="bg-[#111111] border-[#262626] text-white md:w-80">
              <SelectValue placeholder="Select a connected Facebook Page" />
            </SelectTrigger>
            <SelectContent>
              {pages.map(p => (
                <SelectItem key={p.id} value={p.fb_page_id}>
                  {p.name} ({p.fb_page_id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={String(sinceDays)} onValueChange={(v) => setSinceDays(Number(v))}>
            <SelectTrigger className="bg-[#111111] border-[#262626] text-white md:w-40">
              <SelectValue placeholder="Period (days)" />
            </SelectTrigger>
            <SelectContent>
              {[7,14,30,60,90].map(v => (
                <SelectItem key={v} value={String(v)}>{v} days</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={run} disabled={!selectedPage || isRunning} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
            {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
            Analyze
          </Button>

          <Button onClick={loadLatest} disabled={!selectedPage || isRunning} variant="outline" className="border-[#262626] text-white">
            <RefreshCw className="w-4 h-4 mr-2" /> Load Latest
          </Button>
        </div>

        {latestAnalysis ? (
          <div className="mt-4 space-y-3">
            <div className="text-sm text-[#a3a3a3]">
              Page: <span className="text-white font-medium">{latestAnalysis.page_name}</span> •
              Period: {latestAnalysis.period_days} days •
              Posts: {latestAnalysis.posts_analyzed} • Comments: {latestAnalysis.comments_analyzed}
            </div>
            <div className="p-4 rounded-lg bg-[#141414] border border-[#262626] text-sm text-white">
              {latestAnalysis.summary}
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#141414] border border-[#262626]">
                <div className="text-xs text-[#a3a3a3] mb-2">Top Motivations</div>
                <div className="text-sm text-white">{(latestAnalysis.top_motivations || []).join(', ') || '—'}</div>
              </div>
              <div className="p-3 rounded-lg bg-[#141414] border border-[#262626]">
                <div className="text-xs text-[#a3a3a3] mb-2">Cognitive Style Signals</div>
                <div className="text-sm text-white">{(latestAnalysis.cognitive_style_signals || []).join(', ') || '—'}</div>
              </div>
              <div className="p-3 rounded-lg bg-[#141414] border border-[#262626]">
                <div className="text-xs text-[#a3a3a3] mb-2">Risk Profile Signals</div>
                <div className="text-sm text-white">{(latestAnalysis.risk_profile_signals || []).join(', ') || '—'}</div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#141414] border border-[#262626]">
              <div className="text-xs text-[#a3a3a3] mb-2">Recommendations</div>
              <ul className="list-disc list-inside text-sm text-white space-y-1">
                {(latestAnalysis.content_recommendations || []).map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-sm text-[#a3a3a3]">Run an analysis to see psychographic insights from your Page’s posts and comments.</div>
        )}
      </CardContent>
    </Card>
  );
}