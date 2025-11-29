
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Link as LinkIcon, Check, AlertTriangle, ListChecks } from "lucide-react";
import { GoogleAccount } from "@/entities/GoogleAccount";
import { User } from "@/entities/User";
import { googleAuthStart } from "@/functions/googleAuthStart";
import { googleAdsListAccessibleCustomers } from "@/functions/googleAdsListAccessibleCustomers";

export default function GoogleAdsConnectPanel() {
  const [connected, setConnected] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [customers, setCustomers] = React.useState([]);
  const [isListing, setIsListing] = React.useState(false);
  const [error, setError] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const user = await User.me();
      const accs = await GoogleAccount.filter({ user_id: user.id }, "-updated_date", 1);
      setConnected(!!(accs && accs[0]));
    } catch (e) {
      // If fetching user or filtering GoogleAccount fails, assume not connected or an error occurred.
      // This could happen if the user is not logged in or API call fails.
      setConnected(false);
      // Optionally, set an error message here if it's critical to display connection issues.
      // console.error("Failed to load Google Account connection status:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleConnect = async () => {
    const { data } = await googleAuthStart({ return_to: "/GoogleData" });
    if (data?.auth_url) window.location.href = data.auth_url;
  };

  const handleListCustomers = async () => {
    setIsListing(true);
    setError(''); // Clear any previous errors
    setCustomers([]); // Clear previous customers list
    try {
      const { data } = await googleAdsListAccessibleCustomers({});
      if (data?.error) {
        throw new Error(data.error);
      }
      setCustomers(data?.customers || []);
    } catch(err) {
      setError(err.message);
    } finally {
      setIsListing(false);
    }
  };

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader>
        <CardTitle className="text-white">Google Ads</CardTitle>
        <CardDescription className="text-[#a3a3a3]">
          Verify access to Google Ads accounts linked to your Google login, then proceed to campaign-level analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-[#a3a3a3]">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Checking connection…
          </div>
        ) : connected ? (
          <>
            <div className="flex items-center gap-2">
              <Badge className="bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30">
                <Check className="w-3 h-3 mr-1" />
                Connected
              </Badge>
              <span className="text-sm text-white">Google account linked</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-[#262626]" onClick={handleListCustomers} disabled={isListing}>
                {isListing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <ListChecks className="w-4 h-4 mr-2" />}
                List Accessible Customers
              </Button>
            </div>
            {error && (
                <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                </div>
            )}
            {customers.length > 0 ? (
              <div className="mt-2">
                <p className="text-sm text-[#a3a3a3] mb-2">Accessible Google Ads Accounts:</p>
                <ul className="space-y-1">
                  {customers.map((name) => (
                    <li key={name} className="text-sm text-white flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-[#00d4ff]" /> {name}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-[#6b7280] mt-3">
                  Next: enable a developer token and set it at the workspace level to fetch campaigns and metrics.
                </p>
              </div>
            ) : (
              <p className="text-xs text-[#6b7280]">
                {!error && "No accounts listed yet. Click “List Accessible Customers” to verify access."}
              </p>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-[#a3a3a3]">No Google account connected for Ads. Connect Google first.</p>
            <div className="flex items-center gap-2 text-xs text-[#f59e0b]">
              <AlertTriangle className="w-3 h-3" /> You’ll need Google Ads access on the same Google account.
            </div>
            <Button onClick={handleConnect} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
              Connect Google
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
