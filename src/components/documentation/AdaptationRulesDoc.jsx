import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SlidersHorizontal } from 'lucide-react';

export default function AdaptationRulesDoc() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
          <SlidersHorizontal className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Adaptation Rules</h1>
          <p className="text-gray-400">Define custom psychographic-to-UI mappings and test them before SDK deployment.</p>
        </div>
      </div>

      <Card className="bg-[#111] border-white/10">
        <CardContent className="p-6 space-y-4 text-gray-300">
          <p>The Adaptation Rules dashboard lets teams create app-specific rules that connect psychographic triggers to component variants.</p>
          <ul className="list-disc ml-5 space-y-2">
            <li>Choose one or more psychographic triggers such as hesitation or achievement orientation.</li>
            <li>Target a UI component and assign a text or layout variant.</li>
            <li>Preview the resulting behavior in a built-in simulator before deployment.</li>
          </ul>
          <p>This feature is implemented as an app-level configuration workflow backed by the <code className="text-cyan-400">AdaptationRule</code> entity and a dedicated dashboard page.</p>
        </CardContent>
      </Card>
    </div>
  );
}