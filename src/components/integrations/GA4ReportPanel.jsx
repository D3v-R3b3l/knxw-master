import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { gaListProperties } from "@/functions/gaListProperties";
import { gaRunReport } from "@/functions/gaRunReport";
import { gaGetMetadata } from "@/functions/gaGetMetadata";
import { Loader2, BarChart3, AlertCircle } from "lucide-react";
import { MultiSelect } from "@/components/ui/multiselect";
import { GoogleAccount } from "@/entities/GoogleAccount";
import { User } from "@/entities/User";

export default function GA4ReportPanel() {
  const [loadingProps, setLoadingProps] = useState(false);
  const [properties, setProperties] = useState([]);
  const [propertyId, setPropertyId] = useState("");
  
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [dimensionsMeta, setDimensionsMeta] = useState([]);
  const [metricsMeta, setMetricsMeta] = useState([]);

  const [isRunning, setIsRunning] = useState(false);
  const [rows, setRows] = useState([]);
  
  const [selectedDimensions, setSelectedDimensions] = useState(["pagePath"]);
  const [selectedMetrics, setSelectedMetrics] = useState(["screenPageViews"]);
  const [startDate, setStartDate] = useState("7daysAgo");
  const [endDate, setEndDate] = useState("today");
  
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function checkConnection() {
      try {
        const user = await User.me();
        const accounts = await GoogleAccount.filter({ user_id: user.id });
        const connected = accounts && accounts.length > 0;
        setIsConnected(connected);
        if (connected) {
          loadProps();
        }
      } catch (e) {
        setIsConnected(false);
      }
    }
    checkConnection();
  }, []);

  const loadProps = async () => {
    setLoadingProps(true);
    setError('');
    try {
        const { data } = await gaListProperties({});
        if(data?.error) throw new Error(data.error);
        setProperties(data?.properties || []);
    } catch(e) {
        setError(e.message || 'Failed to load GA4 properties.');
        setProperties([]);
    } finally {
        setLoadingProps(false);
    }
  };

  useEffect(() => {
    const loadMetadata = async () => {
      if (!propertyId || !isConnected) {
        setDimensionsMeta([]);
        setMetricsMeta([]);
        return;
      }
      setLoadingMeta(true);
      setError('');
      try {
        const { data } = await gaGetMetadata({ property_id: propertyId });
        if(data?.error) throw new Error(data.error);
        const newDimensions = data.dimensions || [];
        const newMetrics = data.metrics || [];
        setDimensionsMeta(newDimensions);
        setMetricsMeta(newMetrics);

        setSelectedDimensions(prev => prev.filter(d => newDimensions.some(metaD => metaD.apiName === d)));
        if (selectedDimensions.length === 0 && newDimensions.some(metaD => metaD.apiName === "pagePath")) {
          setSelectedDimensions(["pagePath"]);
        } else if (selectedDimensions.length === 0 && newDimensions.length > 0) {
          setSelectedDimensions([newDimensions[0].apiName]);
        }

        setSelectedMetrics(prev => prev.filter(m => newMetrics.some(metaM => metaM.apiName === m)));
        if (selectedMetrics.length === 0 && newMetrics.some(metaM => metaM.apiName === "screenPageViews")) {
          setSelectedMetrics(["screenPageViews"]);
        } else if (selectedMetrics.length === 0 && newMetrics.length > 0) {
          setSelectedMetrics([newMetrics[0].apiName]);
        }

      } catch (error) {
        console.error("Failed to load GA4 metadata:", error);
        setError(error.message || 'Failed to load metadata.');
        setDimensionsMeta([]);
        setMetricsMeta([]);
      } finally {
        setLoadingMeta(false);
      }
    };
    loadMetadata();
  }, [propertyId, isConnected]);

  const run = async () => {
    if (!propertyId || selectedDimensions.length === 0 || selectedMetrics.length === 0) return;
    setIsRunning(true);
    setRows([]);
    setError('');
    try {
      const { data } = await gaRunReport({
        property_id: propertyId,
        dimensions: selectedDimensions,
        metrics: selectedMetrics,
        start_date: startDate,
        end_date: endDate
      });
      if(data?.error) throw new Error(data.error);
      const report = data?.report;
      setRows(report?.rows || []);
    } catch (error) {
        console.error("Failed to run GA4 report:", error);
        setError(error.message || 'Failed to run report.');
    } finally {
        setIsRunning(false);
    }
  };

  const headers = [...selectedDimensions, ...selectedMetrics];
  
  const dimensionOptions = dimensionsMeta.map(d => ({ value: d.apiName, label: d.uiName }));
  const metricOptions = metricsMeta.map(m => ({ value: m.apiName, label: m.uiName }));

  if (!isConnected) {
    return (
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader className="p-6">
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#a3a3a3]" />
            GA4 Quick Report
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 text-center text-[#a3a3a3]">
          Please connect your Google account first to use this feature.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader className="p-6">
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#00d4ff]" />
          GA4 Quick Report
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-4">
        {error && (
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">{error}</p>
            </div>
        )}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3">
          <Select value={propertyId} onValueChange={setPropertyId} disabled={loadingProps}>
            <SelectTrigger className="bg-[#111111] border-[#262626] text-white lg:col-span-2">
              <SelectValue placeholder={loadingProps ? "Loading properties..." : "Select GA4 Property"} />
            </SelectTrigger>
            <SelectContent>
              {properties.map(p => (
                <SelectItem key={p.property_id} value={p.property_id}>
                  {p.property_name} ({p.property_id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <MultiSelect
            options={dimensionOptions}
            selected={selectedDimensions}
            onChange={setSelectedDimensions}
            placeholder={loadingMeta ? "Loading Dimensions..." : "Select Dimensions"}
            className="lg:col-span-1"
            disabled={!propertyId || loadingMeta}
          />
          <MultiSelect
            options={metricOptions}
            selected={selectedMetrics}
            onChange={setSelectedMetrics}
            placeholder={loadingMeta ? "Loading Metrics..." : "Select Metrics"}
            className="lg:col-span-1"
            disabled={!propertyId || loadingMeta}
          />
          
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start (YYYY-MM-DD or 7daysAgo)"
              className="bg-[#111111] border-[#262626] text-white"
            />
            <Input
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End (YYYY-MM-DD or today)"
              className="bg-[#111111] border-[#262626] text-white"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={run} disabled={!propertyId || isRunning || selectedDimensions.length === 0 || selectedMetrics.length === 0} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
            {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Run Report
          </Button>
        </div>

        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-[#a3a3a3] border-b border-[#262626]">
                {headers.map((h) => <th key={h} className="py-2 pr-4 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((row, idx) => {
                  const dimVals = row.dimensionValues?.map(d => d.value) || [];
                  const metVals = row.metricValues?.map(m => m.value) || [];
                  const vals = [...dimVals, ...metVals];
                  return (
                    <tr key={idx} className="border-b border-[#1f1f1f]">
                      {vals.map((v, i) => <td key={i} className="py-2 pr-4 text-white">{v}</td>)}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={headers.length || 1} className="py-3 text-[#6b7280]">
                    {isRunning ? "Loading report..." : "No results yet. Select a property, dimensions, and metrics, then run the report."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}