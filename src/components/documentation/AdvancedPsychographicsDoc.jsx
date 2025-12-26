import React from 'react';
import { Brain, TrendingUp, AlertTriangle, Sliders } from 'lucide-react';
import Section from './Section';
import CodeBlock from './CodeBlock';

export default function AdvancedPsychographicsDoc() {
  return (
    <div className="space-y-8">
      <Section icon={Brain} title="Advanced Psychographic Profiling">
        <p className="text-[#a3a3a3] mb-4">
          knXw's advanced psychographic capabilities go beyond basic profiling to detect subtle emotional shifts, 
          cognitive biases, and temporal patterns in user psychology.
        </p>

        <h3 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#00d4ff]" />
          Cognitive Bias Detection
        </h3>
        <p className="text-[#a3a3a3] mb-4">
          Automatically identify cognitive biases that influence user decision-making:
        </p>
        <ul className="list-disc list-inside text-[#a3a3a3] space-y-2 mb-4">
          <li><strong>Anchoring Bias:</strong> User repeatedly focuses on initial information</li>
          <li><strong>Confirmation Bias:</strong> Limited exploration of alternative options</li>
          <li><strong>Recency Bias:</strong> Disproportionate focus on recent events</li>
          <li><strong>Loss Aversion:</strong> Hesitation and exit intent before commitment</li>
        </ul>

        <CodeBlock language="javascript" code={`// Detect cognitive biases for a user
const response = await base44.functions.invoke('detectCognitiveBiases', {
  user_id: 'user_123',
  time_window_days: 30
});

console.log(response.data.detected_biases);
// [
//   {
//     bias_name: "Anchoring Bias",
//     strength: 0.72,
//     confidence: 0.75,
//     explanation: "User shows repeated focus on specific features..."
//   }
// ]`} />

        <h3 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#00d4ff]" />
          Emotional Shift Analysis
        </h3>
        <p className="text-[#a3a3a3] mb-4">
          Track subtle changes in emotional state over time with magnitude and significance ratings:
        </p>

        <CodeBlock language="javascript" code={`// Analyze emotional shifts
const response = await base44.functions.invoke('analyzeEmotionalShifts', {
  user_id: 'user_123',
  time_window_days: 30
});

console.log(response.data);
// {
//   shifts: [
//     {
//       shift_type: "mood_change",
//       from: "neutral",
//       to: "anxious",
//       magnitude: 0.45,
//       significance: "high",
//       timestamp: "2025-12-20T10:30:00Z"
//     }
//   ],
//   analysis_summary: {
//     volatility_score: 0.34,
//     most_common_shift: "confidence_change"
//   }
// }`} />

        <h3 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#00d4ff]" />
          Psychographic Trend Visualization
        </h3>
        <p className="text-[#a3a3a3] mb-4">
          Visualize how user psychology evolves over time with automated snapshots:
        </p>

        <CodeBlock language="javascript" code={`// Create a psychographic snapshot
const response = await base44.functions.invoke('createPsychographicSnapshot', {
  user_id: 'user_123'
});

// Snapshots are automatically created and stored
// Access them via the PsychographicSnapshot entity
const snapshots = await base44.entities.PsychographicSnapshot.filter({
  user_id: 'user_123'
}, '-snapshot_date', 30);

// Each snapshot includes:
// - Full psychographic state at that moment
// - Detected cognitive biases
// - Change indicators (emotional shift, motivation drift, volatility)`} />

        <h3 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#00d4ff]" />
          Custom Psychographic Dimensions
        </h3>
        <p className="text-[#a3a3a3] mb-4">
          Define industry-specific psychographic traits relevant to your business:
        </p>

        <CodeBlock language="javascript" code={`// Create a custom dimension
await base44.entities.CustomPsychographicDimension.create({
  client_app_id: 'app_123',
  dimension_name: 'Brand Affinity',
  dimension_type: 'numeric',
  industry: 'e-commerce',
  description: 'Measures emotional connection to brand',
  calculation_logic: {
    input_events: ['product_view', 'brand_interaction', 'review_submission'],
    weighting_formula: 'engagement_depth * sentiment_score',
    min_value: 0,
    max_value: 1
  },
  active: true
});

// Custom dimensions are automatically calculated
// and included in psychographic snapshots`} />

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-6">
          <p className="text-blue-400 text-sm">
            <strong>Pro Tip:</strong> Combine cognitive bias detection with emotional shift analysis to 
            identify the perfect moments for intervention and personalized engagement.
          </p>
        </div>

        <h3 className="text-xl font-bold text-white mt-8 mb-4">Data Provenance & Confidence</h3>
        <p className="text-[#a3a3a3] mb-4">
          All psychographic inferences include confidence scores and data provenance tracking:
        </p>

        <CodeBlock language="javascript" code={`// Profile includes confidence scores for each attribute
const profile = await base44.entities.UserPsychographicProfile.filter({
  user_id: 'user_123'
}, '-last_analyzed', 1);

console.log({
  motivation_confidence: profile.motivation_confidence_score, // 0-1
  emotional_confidence: profile.emotional_state_confidence_score,
  risk_confidence: profile.risk_profile_confidence_score,
  
  // Provenance tracking shows source and timestamp for each inference
  provenance: profile.provenance
  // {
  //   "emotional_state": [
  //     { source: "behavior_analysis", ts: "2025-12-26", weight: 0.8 },
  //     { source: "explicit_feedback", ts: "2025-12-25", weight: 0.2 }
  //   ]
  // }
});`} />
      </Section>
    </div>
  );
}