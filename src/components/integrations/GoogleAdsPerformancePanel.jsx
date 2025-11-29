import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { googleAdsListAccessibleCustomers } from '@/functions/googleAdsListAccessibleCustomers';
import { googleAdsGetCampaigns } from '@/functions/googleAdsGetCampaigns';
import { Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { GoogleAccount } from "@/entities/GoogleAccount";
import { User } from "@/entities/User";

export default function GoogleAdsPerformancePanel() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [error, setError] = useState('');
  
  const [startDate, setStartDate] = useState(format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    async function checkConnection() {
      try {
        const user = await User.me();
        const accounts = await GoogleAccount.filter({ user_id: user.id });
        const connected = accounts && accounts.length > 0;
        setIsConnected(connected);
        if (connected) {
          loadCustomers();
        }
      } catch (e) {
        setIsConnected(false);
      }
    }
    checkConnection();
  }, []);

  const loadCustomers = async () => {
      setLoadingCustomers(true);
      setError('');
      try {
        const { data } = await googleAdsListAccessibleCustomers({});
        if (data?.error) {
          throw new Error(data.error);
        }
        if (data?.customers) {
          setCustomers(data.customers);
        } else {
          setCustomers([]);
        }
      } catch (err) {
        console.error('Error loading Google Ads customers:', err);
        setError(err.message || 'Failed to load Google Ads customers. Please ensure your Google account is connected and has Ads access.');
        setCustomers([]);
      } finally {
        setLoadingCustomers(false);
      }
  };

  const handleFetchCampaigns = async () => {
    if (!selectedCustomer) {
      setError('Please select a customer account.');
      return;
    }
    setLoadingCampaigns(true);
    setError('');
    setCampaigns([]);
    try {
      const { data } = await googleAdsGetCampaigns({
        customer_id: selectedCustomer,
        start_date: startDate,
        end_date: endDate,
      });
      if(data?.error) throw new Error(data.error);
      setCampaigns(data?.campaigns || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch campaign data.');
    } finally {
      setLoadingCampaigns(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#a3a3a3]" />
            Google Ads Campaign Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-center text-[#a3a3a3]">
          Please connect your Google account first to use this feature.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#00d4ff]" />
          Google Ads Campaign Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select value={selectedCustomer} onValueChange={setSelectedCustomer} disabled={loadingCustomers || customers.length === 0}>
            <SelectTrigger className="bg-[#111111] border-[#262626] text-white lg:col-span-2">
              <SelectValue placeholder={loadingCustomers ? 'Loading customers...' : 'Select a Google Ads Customer'} />
            </SelectTrigger>
            <SelectContent>
              {customers.map(customerId => (
                  <SelectItem key={customerId} value={customerId}>
                    Customer ID: {customerId}
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-[#111111] border-[#262626] text-white"/>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-[#111111] border-[#262626] text-white"/>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleFetchCampaigns} disabled={loadingCampaigns || !selectedCustomer}>
            {loadingCampaigns && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Fetch Campaigns
          </Button>
        </div>

        {error && (
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">{error}</p>
            </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-right">Avg. CPC</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingCampaigns ? (
                <TableRow><TableCell colSpan={8} className="text-center p-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#a3a3a3]"/></TableCell></TableRow>
              ) : campaigns.length > 0 ? (
                campaigns.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-white">{c.name}</TableCell>
                    <TableCell>{c.status}</TableCell>
                    <TableCell className="text-right">{Number(c.impressions).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{Number(c.clicks).toLocaleString()}</TableCell>
                    <TableCell className="text-right">{(c.ctr * 100).toFixed(2)}%</TableCell>
                    <TableCell className="text-right">${c.cpc.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${c.cost.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{Number(c.conversions).toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={8} className="text-center text-[#a3a3a3] p-8">No campaign data to display. Run a fetch to see results.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}