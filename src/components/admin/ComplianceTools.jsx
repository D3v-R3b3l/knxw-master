import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Download, Trash2, ShieldAlert, Loader2 } from "lucide-react";
import { exportUserData } from "@/functions/exportUserData";
import { requestDataDeletion } from "@/functions/requestDataDeletion";
import { processDataDeletion } from "@/functions/processDataDeletion";

export default function ComplianceTools() {
  const [activeTab, setActiveTab] = React.useState("export");
  const [subject, setSubject] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [resultMessage, setResultMessage] = React.useState("");

  const handleExport = async () => {
    if (!subject) return;
    setLoading(true);
    setResultMessage("");
    const { data, status } = await exportUserData({ subject_user_id: subject });
    if (status === 200) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `knxw_export_${subject}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      setResultMessage("Export generated and downloaded.");
    } else {
      setResultMessage("Export failed.");
    }
    setLoading(false);
  };

  const handleDeletionRequest = async () => {
    if (!subject) return;
    setLoading(true);
    setResultMessage("");
    const { data, status } = await requestDataDeletion({ subject_user_id: subject, reason: "User request (GDPR/CCPA)." });
    if (status === 200) {
      setResultMessage(`Deletion request created (ID: ${data.data_request_id}). Admin approval required.`);
    } else {
      setResultMessage("Deletion request failed.");
    }
    setLoading(false);
  };

  const handleImmediateDeletion = async () => {
    if (!subject) return;
    if (!confirm("This will permanently delete the user's data. Continue?")) return;
    setLoading(true);
    setResultMessage("");
    const { data, status } = await requestDataDeletion({ subject_user_id: subject, reason: "Admin initiated immediate deletion." });
    if (status === 200) {
      const { data: processed } = await processDataDeletion({ data_request_id: data.data_request_id });
      setResultMessage(`Deletion completed: ${JSON.stringify(processed.counts)}`);
    } else {
      setResultMessage("Deletion action failed.");
    }
    setLoading(false);
  };

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader className="p-6">
        <CardTitle className="text-white">GDPR/CCPA Data Tools</CardTitle>
        <CardDescription className="text-[#a3a3a3]">Export user data or process deletion requests with full audit logging.</CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#0f0f0f] border border-[#262626]">
            <TabsTrigger value="export" className="data-[state=active]:bg-[#00d4ff] data-[state=active]:text-[#0a0a0a]">Right to Access (Export)</TabsTrigger>
            <TabsTrigger value="delete" className="data-[state=active]:bg-[#ef4444] data-[state=active]:text-white">Right to be Forgotten (Delete)</TabsTrigger>
          </TabsList>
          <TabsContent value="export" className="mt-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="text-sm text-[#a3a3a3]">User Identifier (user_id or email)</label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="user_123 or user@company.com" className="bg-[#1a1a1a] border-[#262626] text-white" />
              </div>
              <div className="flex items-end">
                <Button onClick={handleExport} disabled={!subject || loading} className="w-full bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                  Export JSON
                </Button>
              </div>
            </div>
            {resultMessage && <p className="text-sm text-[#a3a3a3] mt-3">{resultMessage}</p>}
          </TabsContent>
          <TabsContent value="delete" className="mt-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="text-sm text-[#a3a3a3]">User Identifier (user_id or email)</label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="user_123 or user@company.com" className="bg-[#1a1a1a] border-[#262626] text-white" />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleDeletionRequest} disabled={!subject || loading} variant="outline" className="w-full border-[#262626] text-[#a3a3a3] hover:bg-[#262626] hover:text-white">
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  Create Request
                </Button>
                <Button onClick={handleImmediateDeletion} disabled={!subject || loading} className="w-full bg-[#ef4444] hover:bg-[#dc2626] text-white">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Now (Admin)
                </Button>
              </div>
            </div>
            {resultMessage && <p className="text-sm text-[#a3a3a3] mt-3">{resultMessage}</p>}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}