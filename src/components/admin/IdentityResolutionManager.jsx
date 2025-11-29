import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CoreCustomer, CoreAccount } from "@/entities/all";
import { identityResolution } from "@/functions/identityResolution";
import { 
  Link, 
  Users, 
  Database, 
  Search, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Wand2,
  GitMerge,
  ArrowRight
} from 'lucide-react';
import { toast } from "sonner";

export default function IdentityResolutionManager() {
  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterConfidence, setFilterConfidence] = useState('all');
  const [filterResolutionMethod, setFilterResolutionMethod] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [resolutionStats, setResolutionStats] = useState({});
  const [potentialDuplicates, setPotentialDuplicates] = useState([]);
  const [merging, setMerging] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [customersData, accountsData, statsData, duplicatesData] = await Promise.all([
        CoreCustomer.list('-created_date', 200),
        CoreAccount.list('-created_date', 100),
        identityResolution({ action: 'get_resolution_stats' }).then(r => r.data),
        identityResolution({ action: 'find_potential_duplicates' }).then(r => r.data.duplicates)
      ]);
      
      setCustomers(customersData || []);
      setAccounts(accountsData || []);
      setResolutionStats(statsData || {});
      setPotentialDuplicates(duplicatesData || []);
    } catch (error) {
      console.error('Error loading identity resolution data:', error);
      toast.error("Failed to load data. Please try again.");
    }
    setIsLoading(false);
  };

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      (customer.customer_id && customer.customer_id.toLowerCase().includes(searchLower)) ||
      (customer.email_hash && customer.email_hash.toLowerCase().includes(searchLower)) ||
      Object.values(customer.external_ids || {}).some(id => 
        id?.toLowerCase().includes(searchLower)
      );
    
    const matchesConfidence = filterConfidence === 'all' || 
      (filterConfidence === 'high' && customer.identity_resolution?.match_confidence >= 0.9) ||
      (filterConfidence === 'medium' && customer.identity_resolution?.match_confidence >= 0.7 && customer.identity_resolution?.match_confidence < 0.9) ||
      (filterConfidence === 'low' && customer.identity_resolution?.match_confidence < 0.7);

    const matchesMethod = filterResolutionMethod === 'all' ||
      customer.identity_resolution?.resolution_method === filterResolutionMethod;

    return matchesSearch && matchesConfidence && matchesMethod;
  });

  const runIdentityResolution = async (customerId) => {
    toast.info("Re-running identity resolution...");
    try {
      const { data } = await identityResolution({ 
        action: 'resolve_customer_identity', 
        customer_id: customerId 
      });
      
      if (data.success) {
        toast.success("Identity resolution completed successfully.");
        await loadData();
      } else {
        toast.error(data.error || "Identity resolution failed.");
      }
    } catch (error) {
      console.error('Error running identity resolution:', error);
      toast.error("An unexpected error occurred.");
    }
  };

  const mergeCustomers = async (primaryId, duplicateId) => {
    setMerging({ primaryId, duplicateId });
    toast.info("Merging duplicate customers...");
    try {
      const { data } = await identityResolution({ 
        action: 'merge_customers', 
        primary_customer_id: primaryId,
        duplicate_customer_id: duplicateId
      });
      
      if (data.success) {
        toast.success("Customers merged successfully.");
        await loadData();
      } else {
         toast.error(data.error || "Failed to merge customers.");
      }
    } catch (error) {
      console.error('Error merging customers:', error);
      toast.error("An unexpected error occurred during merge.");
    } finally {
      setMerging(null);
    }
  };

  const getConfidenceBadge = (confidence) => {
    if (confidence >= 0.9) {
      return <Badge className="bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30">High</Badge>;
    } else if (confidence >= 0.7) {
      return <Badge className="bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30">Medium</Badge>;
    } else {
      return <Badge className="bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30">Low</Badge>;
    }
  };

  const getResolutionMethodBadge = (method) => {
    const badges = {
      deterministic: <Badge className="bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30">Deterministic</Badge>,
      email_hash: <Badge className="bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30">Email Hash</Badge>,
      domain_match: <Badge className="bg-[#8b5cf6]/20 text-[#8b5cf6] border-[#8b5cf6]/30">Domain Match</Badge>
    };
    return badges[method] || <Badge variant="outline">Unknown</Badge>;
  };

  const renderExternalId = (system, id) => (
    <div key={system} className="flex items-center justify-between p-2 bg-[#0a0a0a] rounded border border-[#262626]">
      <span className="text-[#a3a3a3] text-sm capitalize">{system.replace(/_/g, ' ')}</span>
      <code className="text-[#10b981] text-sm">{id}</code>
    </div>
  );

  const CustomerCard = ({ customer, actions = true }) => (
    <Card className="bg-[#111111] border-[#262626] hover:border-[#00d4ff]/30 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <code className="text-[#00d4ff] font-mono text-sm break-all">{customer.customer_id}</code>
              {customer.identity_resolution?.match_confidence !== undefined && 
                getConfidenceBadge(customer.identity_resolution.match_confidence)
              }
              {customer.identity_resolution?.resolution_method && 
                getResolutionMethodBadge(customer.identity_resolution.resolution_method)
              }
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-2">External IDs</h4>
                <div className="space-y-2">
                  {Object.entries(customer.external_ids || {}).map(([system, id]) => renderExternalId(system, id))}
                  {Object.keys(customer.external_ids || {}).length === 0 && (
                    <p className="text-[#a3a3a3] text-sm italic">No external IDs linked</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Identity Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-[#0a0a0a] rounded border border-[#262626]">
                    <span className="text-[#a3a3a3] text-sm">Email Hash</span>
                    <code className="text-[#8b5cf6] text-xs font-mono break-all">
                      {customer.email_hash ? `${customer.email_hash.substring(0, 12)}...` : 'N/A'}
                    </code>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#0a0a0a] rounded border border-[#262626]">
                    <span className="text-[#a3a3a3] text-sm">Confidence</span>
                    <span className="text-white text-sm">
                      {customer.identity_resolution?.match_confidence 
                        ? `${(customer.identity_resolution.match_confidence * 100).toFixed(1)}%`
                        : 'Unknown'
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#0a0a0a] rounded border border-[#262626]">
                    <span className="text-[#a3a3a3] text-sm">Data Sources:</span>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {(customer.profile_metadata?.data_sources || []).map(source => (
                        <Badge key={source} variant="outline" className="text-xs capitalize border-[#262626] text-[#a3a3a3]">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {actions && (
            <div className="ml-4">
              <Button
                variant="ghost"
                size="icon"
                title="Re-run Identity Resolution"
                onClick={() => runIdentityResolution(customer.customer_id)}
              >
                <Wand2 className="w-4 h-4 text-[#a3a3a3] hover:text-[#00d4ff]" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9]">
            <Link className="w-6 h-6 text-[#0a0a0a]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Identity Resolution Manager</h2>
            <p className="text-[#a3a3a3]">Manage customer identity linking across CRM and finance systems</p>
          </div>
        </div>
        <Button onClick={loadData} disabled={isLoading} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-sm text-[#a3a3a3]">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{customers.length.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-sm text-[#a3a3a3]">High Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#10b981]">{resolutionStats.high_confidence_count || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-sm text-[#a3a3a3]">Needs Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#f59e0b]">{resolutionStats.low_confidence_count || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#111111] border-[#262626]">
          <CardHeader>
            <CardTitle className="text-sm text-[#a3a3a3]">Resolution Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#8b5cf6]">{resolutionStats.resolution_rate ? `${resolutionStats.resolution_rate.toFixed(1)}%` : '--'}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="customers" className="w-full">
        <TabsList className="bg-[#111111] border border-[#262626]">
          <TabsTrigger value="customers">Customer Identities</TabsTrigger>
          <TabsTrigger value="duplicates">Duplicate Detection</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
              <Input
                placeholder="Search by ID or email hash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#111111] border-[#262626] text-white"
              />
            </div>
            <Select value={filterConfidence} onValueChange={setFilterConfidence}>
              <SelectTrigger className="w-48 bg-[#111111] border-[#262626] text-white"><SelectValue/></SelectTrigger>
              <SelectContent><SelectItem value="all">All Confidence</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="low">Low</SelectItem></SelectContent>
            </Select>
            <Select value={filterResolutionMethod} onValueChange={setFilterResolutionMethod}>
              <SelectTrigger className="w-48 bg-[#111111] border-[#262626] text-white"><SelectValue/></SelectTrigger>
              <SelectContent><SelectItem value="all">All Methods</SelectItem><SelectItem value="deterministic">Deterministic</SelectItem><SelectItem value="email_hash">Email Hash</SelectItem><SelectItem value="domain_match">Domain Match</SelectItem></SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-[#00d4ff]" /></div>
            ) : filteredCustomers.length === 0 ? (
              <Card className="bg-[#111111] border-[#262626] text-center py-12">
                <Users className="w-12 h-12 text-[#a3a3a3] mx-auto mb-4" />
                <h3 className="text-white font-semibold">No customers found</h3>
                <p className="text-[#a3a3a3]">Try adjusting your filters.</p>
              </Card>
            ) : (
              filteredCustomers.map(customer => <CustomerCard key={customer.customer_id} customer={customer} />)
            )}
          </div>
        </TabsContent>

        <TabsContent value="duplicates" className="space-y-6">
          <Card className="bg-[#111111] border-[#262626]">
            <CardHeader>
              <CardTitle>Potential Duplicates</CardTitle>
              <CardDescription>Review and merge potential duplicate customer profiles identified by the system.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-[#00d4ff]" /></div>
              ) : potentialDuplicates.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-[#10b981] mx-auto mb-4" />
                  <h3 className="text-white font-semibold">No Duplicates Found</h3>
                  <p className="text-[#a3a3a3]">The system has not identified any potential duplicate customers at this time.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {potentialDuplicates.map((group, index) => (
                    <div key={index} className="p-4 border border-[#262626] rounded-lg">
                      <h4 className="text-lg font-semibold text-white mb-2">Duplicate Group {index + 1}</h4>
                      <p className="text-sm text-[#a3a3a3] mb-4">Reason: {group.reason}</p>
                      <div className="space-y-4">
                        {group.customers.map((customer, cIndex) => (
                          <div key={customer.customer_id} className="flex items-center gap-4">
                            <div className="flex-1">
                              <CustomerCard customer={customer} actions={false} />
                            </div>
                            {cIndex > 0 && (
                              <div className="flex flex-col items-center gap-2">
                                <ArrowRight className="w-6 h-6 text-[#a3a3a3]" />
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => mergeCustomers(group.customers[0].customer_id, customer.customer_id)}
                                  disabled={merging && (merging.primaryId === group.customers[0].customer_id && merging.duplicateId === customer.customer_id)}
                                >
                                  {merging && (merging.primaryId === group.customers[0].customer_id && merging.duplicateId === customer.customer_id) ? (
                                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                  ) : (
                                    <GitMerge className="w-4 h-4 mr-2" />
                                  )}
                                  Merge into Primary
                                </Button>
                              </div>
                            )}
                            {cIndex === 0 && (
                              <div className="w-[170px] text-center text-sm font-semibold text-white">PRIMARY</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}