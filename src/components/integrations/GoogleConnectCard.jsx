import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Link as LinkIcon, Check, Trash2, Database, Loader2 } from "lucide-react";
import { GoogleAccount } from "@/entities/GoogleAccount";
import { User } from "@/entities/User";
import { googleAuthStart } from "@/functions/googleAuthStart";
import { gaListProperties } from "@/functions/gaListProperties";
import { useToast } from "@/components/ui/use-toast";

export default function GoogleConnectCard() {
  const [account, setAccount] = React.useState(null);
  const [properties, setProperties] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { toast } = useToast();
  
  const connectionCheckInterval = React.useRef(null);
  const authWindow = React.useRef(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const user = await User.me();
      const accounts = await GoogleAccount.filter({ user_id: user.id });
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        setAccount(null);
      }
    } catch (e) {
      console.error(e);
      setAccount(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
    // Cleanup interval on unmount
    return () => {
      if (connectionCheckInterval.current) {
        clearInterval(connectionCheckInterval.current);
      }
    };
  }, [load]);
  
  const checkConnectionStatus = React.useCallback(async () => {
    console.log("Checking connection status...");
    try {
        const user = await User.me();
        const accounts = await GoogleAccount.filter({ user_id: user.id });
        if (accounts && accounts.length > 0) {
            console.log("Connection found!");
            clearInterval(connectionCheckInterval.current);
            if (authWindow.current) authWindow.current.close();
            setIsConnecting(false);
            toast({
                title: "Google Connected",
                description: "Your Google account has been successfully connected.",
            });
            await load();
        }
    } catch(e) {
        console.error("Error checking connection:", e);
    }
  }, [load, toast]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const { data } = await googleAuthStart({});
      if (data?.auth_url) {
        authWindow.current = window.open(data.auth_url, 'googleAuth', 'width=600,height=700');
        
        // Clear any existing interval
        if (connectionCheckInterval.current) {
            clearInterval(connectionCheckInterval.current);
        }

        // Start polling every 3 seconds to check if the connection was made
        connectionCheckInterval.current = setInterval(checkConnectionStatus, 3000);
        
        // Fallback timeout after 5 minutes
        setTimeout(() => {
            if (connectionCheckInterval.current) {
                clearInterval(connectionCheckInterval.current);
                setIsConnecting(false);
                toast({ title: "Connection timed out", variant: "destructive" });
            }
        }, 5 * 60 * 1000);

      } else {
        throw new Error("Could not get authentication URL.");
      }
    } catch (error) {
      console.error('Failed to start Google auth:', error);
      toast({
        title: "Authentication Failed",
        description: error.message || "Unable to start Google authentication process.",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!account) return;
    setIsDeleting(true);
    try {
      await GoogleAccount.delete(account.id);
      setAccount(null);
      toast({
        title: "Google Disconnected",
        description: "Your Google account has been disconnected.",
      });
    } catch (error) {
      console.error("Failed to disconnect Google account:", error);
      toast({
        title: "Disconnection Failed",
        description: "Could not disconnect the Google account. Please try again.",
        variant: "destructive",
      });
    } finally {
        setIsDeleting(false);
    }
  };

  const handleListProps = async () => {
      try {
        const res = await gaListProperties();
        setProperties(res.data.properties);
      } catch(e){
        console.error(e)
      }
  }

  if (loading) {
    return (
      <Card className="bg-[#111111] border-[#262626]">
        <CardContent className="p-6 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-white">Google Integration</CardTitle>
          <CardDescription>Connect your Google Account to access Google Analytics and Google Ads data.</CardDescription>
        </div>
        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google Logo" className="w-8 h-8" />
      </CardHeader>
      <CardContent>
        {account ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-[#1a1a1a] p-3 rounded-lg border border-[#262626]">
              <Check className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-white font-medium">Connected as</p>
                <p className="text-slate-400 text-sm">{account.google_email}</p>
              </div>
            </div>
            <Button onClick={handleDisconnect} variant="destructive" className="w-full" disabled={isDeleting}>
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Disconnect Google Account
            </Button>
          </div>
        ) : (
          <Button onClick={handleConnect} className="w-full bg-blue-600 hover:bg-blue-700" disabled={isConnecting}>
            {isConnecting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LinkIcon className="w-4 h-4 mr-2" />}
            Connect Google
          </Button>
        )}
      </CardContent>
    </Card>
  );
}