import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { pythonWrapper, goWrapper, javaWrapper } from '@/lib/sdkTemplates';

function CodeBlock({ code }) {
  return <pre className="rounded-lg bg-[#0a0a0a] border border-[#262626] p-4 overflow-auto text-xs text-[#d4d4d4] whitespace-pre-wrap">{code}</pre>;
}

export default function LanguageWrappersPanel() {
  return (
    <Card className="bg-[#111111] border-[#262626]">
      <CardHeader>
        <CardTitle className="text-white">Open-source client wrappers</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="python" className="space-y-4">
          <TabsList className="bg-[#0a0a0a] border border-[#262626]">
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="go">Go</TabsTrigger>
            <TabsTrigger value="java">Java</TabsTrigger>
          </TabsList>
          <TabsContent value="python"><CodeBlock code={pythonWrapper} /></TabsContent>
          <TabsContent value="go"><CodeBlock code={goWrapper} /></TabsContent>
          <TabsContent value="java"><CodeBlock code={javaWrapper} /></TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}