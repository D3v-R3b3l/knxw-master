import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Link, Check, Trash2 } from "lucide-react";
import { MetaAccount } from "@/entities/MetaAccount";
import { useToast } from "@/components/ui/use-toast";
import { metaAuthStart } from "@/functions/metaAuthStart";
import { metaListPages } from "@/functions/metaListPages";
import { metaDisconnect } from "@/functions/metaDisconnect";

export default function MetaConnectCard() {
  const [account, setAccount] = React.useState(null);
  const [pages, setPages] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  const load = React.useCallback(async () => {
    setLoading(true);
    const list = await MetaAccount.list();
    setAccount(list?.[0] || null);
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleConnect = async () => {
    const { data } = await metaAuthStart({ return_to: "/Settings?tab=social" });
    if (data?.auth_url) window.location.href = data.auth_url;
  };

  const handleListPages = async () => {
    const { data } = await metaListPages({});
    if (data?.pages) setPages(data.pages);
    if (!data?.pages) {
      toast({ title: "Failed to load pages", variant: "destructive" });
    }
  };

  const handleDisconnect = async () => {
    const { data } = await metaDisconnect({});
    if (data?.success) {
      toast({ title: "Disconnected Meta account", variant: "success" });
      setPages([]);
      load();
    }
  };

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader>
        <CardTitle className="text-white">Meta (Facebook) Connection</CardTitle>
        <CardDescription className="text-[#a3a3a3]">
          Connect a Meta account to read Page insights, comments and likes via Pages API.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-[#a3a3a3]">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading connection…
          </div>
        ) : account ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge className="bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30">
                <Check className="w-3 h-3 mr-1" /> Connected
              </Badge>
              <span className="text-sm text-white">{account.fb_user_name || "Meta user"}</span>
              {account.token_expires_at && (
                <span className="text-xs text-[#6b7280]">
                  Token expires {new Date(account.token_expires_at).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-[#262626]" onClick={handleListPages}>
                <RefreshCw className="w-4 h-4 mr-2" /> List Pages
              </Button>
              <Button variant="destructive" onClick={handleDisconnect}>
                <Trash2 className="w-4 h-4 mr-2" /> Disconnect
              </Button>
            </div>
            {pages.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-[#a3a3a3] mb-2">Pages accessible:</p>
                <ul className="space-y-1">
                  {pages.map((p) => (
                    <li key={p.id} className="text-sm text-white flex items-center gap-2">
                      <Link className="w-4 h-4 text-[#00d4ff]" /> {p.name} <span className="text-[#6b7280]">({p.id})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#a3a3a3]">No Meta account connected.</p>
            <Button onClick={handleConnect} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
              Connect Meta
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}