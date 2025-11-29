import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SSOProviderConfig } from "@/entities/SSOProviderConfig";
import { logAudit } from "@/functions/logAudit";
import { Shield, Loader2 } from "lucide-react";

export default function SSOConfig() {
  const [provider, setProvider] = React.useState("okta");
  const [displayName, setDisplayName] = React.useState("");
  const [metadataUrl, setMetadataUrl] = React.useState("");
  const [clientId, setClientId] = React.useState("");
  const [active, setActive] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [savedConfig, setSavedConfig] = React.useState(null);

  const loadExisting = React.useCallback(async () => {
    const list = await SSOProviderConfig.filter({ provider });
    if (list.length > 0) {
      const c = list[0];
      setDisplayName(c.display_name || "");
      setMetadataUrl(c.metadata_url || "");
      setClientId(c.client_id || "");
      setActive(!!c.active);
      setSavedConfig(c);
    } else {
      setDisplayName("");
      setMetadataUrl("");
      setClientId("");
      setActive(false);
      setSavedConfig(null);
    }
  }, [provider]);

  React.useEffect(() => { loadExisting(); }, [provider, loadExisting]);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      provider,
      display_name: displayName,
      metadata_url: metadataUrl,
      client_id: clientId,
      active
    };
    if (savedConfig) {
      await SSOProviderConfig.update(savedConfig.id, payload);
    } else {
      await SSOProviderConfig.create(payload);
    }
    await logAudit({ action: "sso.config_saved", target_type: "SSOProviderConfig", target_id: provider, details: { provider, active } });
    setSaving(false);
    await loadExisting();
  };

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader className="p-6">
        <CardTitle className="flex items-center gap-2 text-white">
          <Shield className="w-5 h-5 text-[#00d4ff]" />
          SSO / OAuth Configuration
        </CardTitle>
        <CardDescription className="text-[#a3a3a3]">Configure Okta, Azure AD, or Google SSO metadata. Note: Authentication is handled by the platform; these settings prepare role mapping and compliance.</CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm text-[#a3a3a3]">Provider</label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger className="bg-[#1a1a1a] border-[#262626] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="okta">Okta</SelectItem>
                <SelectItem value="azuread">Azure AD</SelectItem>
                <SelectItem value="google">Google</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-[#a3a3a3]">Display Name</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="bg-[#1a1a1a] border-[#262626] text-white" placeholder="Your Org SSO" />
          </div>
          <div className="flex items-end">
            <Badge className={`${active ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30' : 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30'}`}>{active ? 'Active' : 'Inactive'}</Badge>
            <Button variant="outline" onClick={() => setActive(!active)} className="ml-2 border-[#262626] text-[#a3a3a3] hover:bg-[#262626] hover:text-white">
              Toggle
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-[#a3a3a3]">Metadata / Issuer URL</label>
            <Input value={metadataUrl} onChange={(e) => setMetadataUrl(e.target.value)} placeholder="https://your-issuer/.well-known/openid-configuration" className="bg-[#1a1a1a] border-[#262626] text-white" />
          </div>
          <div>
            <label className="text-sm text-[#a3a3a3]">Client ID (OIDC)</label>
            <Input value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="client_id" className="bg-[#1a1a1a] border-[#262626] text-white" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}