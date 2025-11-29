import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportAccessLogs } from "@/functions/exportAccessLogs";
import { Loader2, Download, Copy, Check } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function LogExporter({ orgId }) {
  const [fromDate, setFromDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [format, setFormat] = useState("jsonl");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await exportAccessLogs({
        org_id: orgId,
        from_date: fromDate,
        to_date: toDate,
        format: format,
      });

      if (error || !data.signed_url) {
        throw new Error(error?.details || 'Export failed to start.');
      }
      
      setResult(data);
      toast({
        title: "Export Ready",
        description: "Your log export has been generated. Use the link below to download.",
        variant: "success"
      });

    } catch (err) {
      toast({
        title: "Export Error",
        description: err.message,
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader>
        <CardTitle className="text-white">Export Access & Audit Logs</CardTitle>
        <CardDescription className="text-[#a3a3a3]">
          Generate a secure, downloadable export of logs for compliance and analysis. Links are valid for 24 hours.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="from-date" className="text-sm text-[#a3a3a3]">From</Label>
            <Input id="from-date" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="bg-[#1a1a1a] border-[#262626] text-white" />
          </div>
          <div>
            <Label htmlFor="to-date" className="text-sm text-[#a3a3a3]">To</Label>
            <Input id="to-date" type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="bg-[#1a1a1a] border-[#262626] text-white" />
          </div>
          <div>
            <Label htmlFor="format" className="text-sm text-[#a3a3a3]">Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger id="format" className="bg-[#1a1a1a] border-[#262626] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jsonl">JSONL (.jsonl)</SelectItem>
                <SelectItem value="csv">CSV (.csv)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleExport} disabled={loading} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
            {loading ? "Generating..." : "Generate Export"}
          </Button>
        </div>

        {result && (
          <div className="pt-4 border-t border-[#262626] space-y-3">
            <h4 className="text-white font-medium">Export Complete</h4>
            <div>
              <Label className="text-sm text-[#a3a3a3]">Secure Download Link</Label>
              <div className="flex items-center gap-2">
                <Input readOnly value={result.signed_url} className="font-mono text-xs bg-[#0a0a0a] border-[#262626] text-[#e5e5e5]" />
                <a href={result.signed_url} download={result.filename} target="_blank" rel="noopener noreferrer">
                  <Button size="icon" variant="outline" className="border-[#262626] hover:border-[#00d4ff]/50 hover:bg-[#00d4ff]/10">
                    <Download className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </div>
            <div>
              <Label className="text-sm text-[#a3a3a3]">SHA-256 Checksum</Label>
              <div className="flex items-center gap-2">
                <Input readOnly value={result.checksum} className="font-mono text-xs bg-[#0a0a0a] border-[#262626] text-[#e5e5e5]" />
                <Button size="icon" variant="outline" onClick={() => copyToClipboard(result.checksum)} className="border-[#262626] hover:border-[#00d4ff]/50 hover:bg-[#00d4ff]/10">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}