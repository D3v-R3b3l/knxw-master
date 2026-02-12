import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { searchHybrid } from '@/functions/searchHybrid';
import { evaluateRules } from '@/functions/evaluateRules';

const TestResult = ({ title, status, message }) => {
  const Icon = status === 'pass' ? CheckCircle : status === 'fail' ? XCircle : AlertTriangle;
  const color = status === 'pass' ? 'text-green-500' : status === 'fail' ? 'text-red-500' : 'text-yellow-500';

  return (
    <div className="flex items-start gap-4 p-3 bg-[#1a1a1a] rounded-lg border border-[#262626]">
      <Icon className={`${color} w-5 h-5 mt-1`} />
      <div>
        <h4 className={`font-semibold ${color}`}>{title}</h4>
        <p className="text-sm text-[#a3a3a3]">{message}</p>
      </div>
    </div>
  );
};

export default function TestsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const testResults = [];

    // --- RLS Test ---
    try {
      const allOrgs = await base44.entities.Org.list();
      if (allOrgs.length <= 1) {
        testResults.push({ title: 'RLS: Cross-Org Read', status: 'pass', message: 'Test passed. Only one org visible to current user, as expected.' });
      } else {
        testResults.push({ title: 'RLS: Cross-Org Read', status: 'fail', message: `Test failed. User can see ${allOrgs.length} orgs, but should only see their own.` });
      }
    } catch (error) {
      testResults.push({ title: 'RLS: Cross-Org Read', status: 'fail', message: `Test failed with error: ${error.message}` });
    }
    
    // --- Search Test ---
    try {
      // Assuming the first org and workspace belong to the user
      const orgs = await base44.entities.Org.list();
      const workspaces = await base44.entities.TenantWorkspace.filter({ org_id: orgs[0].id });
      if (workspaces.length > 0) {
        const res = await searchHybrid({ workspace_id: workspaces[0].id, query: 'test' });
        if (res.data && Array.isArray(res.data.results)) {
           testResults.push({ title: 'Search: Workspace Filter', status: 'pass', message: 'Test passed. searchHybrid function returned results successfully.' });
        } else {
           testResults.push({ title: 'Search: Workspace Filter', status: 'fail', message: 'Test failed. searchHybrid did not return a valid result array.' });
        }
      } else {
         testResults.push({ title: 'Search: Workspace Filter', status: 'skipped', message: 'Skipped. No workspaces found for the current user.' });
      }
    } catch (error) {
       testResults.push({ title: 'Search: Workspace Filter', status: 'fail', message: `Test failed with error: ${error.message}` });
    }

    // --- Alerts Test ---
    try {
        await evaluateRules({});
        testResults.push({ title: 'Alerts: Rule Evaluation', status: 'pass', message: 'Test passed. evaluateRules function executed without errors. Check Alerts page for results.' });
    } catch(error) {
        testResults.push({ title: 'Alerts: Rule Evaluation', status: 'fail', message: `Test failed with error: ${error.message}` });
    }

    // --- Access Log Export Test ---
    testResults.push({ title: 'Export: Admin-Only Access', status: 'manual', message: 'Manual test required. Log in as a non-admin user and verify that the "Export" button on the System Health page is disabled or hidden.' });

    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Card className="bg-[#111111] border-[#262626]">
        <CardHeader>
          <CardTitle className="text-white text-2xl">Automated System Tests</CardTitle>
          <CardDescription className="text-[#a3a3a3]">Run tests to verify core security and functionality.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runTests} disabled={loading} className="bg-[#00d4ff] hover:bg-[#0ea5e9] text-[#0a0a0a]">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {loading ? 'Running Tests...' : 'Run All Tests'}
          </Button>

          <div className="mt-6 space-y-4">
            {results.map((result, index) => (
              <TestResult key={index} {...result} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}