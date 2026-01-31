import React from 'react';
import { Code, Package, CheckCircle, Zap } from 'lucide-react';

export default function AdaptiveUIVueDoc() {
  return (
    <div className="prose prose-invert max-w-none">
      <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
        <Package className="w-7 h-7 text-[#42b883]" />
        Vue.js SDK
      </h3>
      
      <p className="text-[#a3a3a3] mb-6">
        Full Vue.js support for the Adaptive UI SDK. Use the same psychographic intelligence in your Vue applications with native composables and components.
      </p>

      <h4 className="text-xl font-semibold text-white mb-4">Installation</h4>

      <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-6 mb-6 not-prose">
        <pre className="bg-black rounded p-4 text-xs text-[#10b981] overflow-x-auto">
{`npm install @knxw/sdk`}
        </pre>
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Setup</h4>

      <p className="text-[#a3a3a3] mb-4">
        Install the PsychographicProvider plugin in your Vue app:
      </p>

      <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-6 mb-6 not-prose">
        <h5 className="text-sm font-semibold text-[#42b883] mb-3">main.js</h5>
        <pre className="bg-black rounded p-4 text-xs text-[#10b981] overflow-x-auto">
{`import { createApp } from 'vue';
import { createPsychographicProvider } from '@knxw/sdk/vue';
import App from './App.vue';

const app = createApp(App);

app.use(createPsychographicProvider({
  apiKey: 'your-knxw-api-key',
  userId: 'user-123',
  useMockData: false // Set to true for development
}));

app.mount('#app');`}
        </pre>
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Composable API</h4>

      <p className="text-[#a3a3a3] mb-4">
        Use the <code className="text-[#42b883] bg-[#1a1a1a] px-2 py-0.5 rounded">usePsychographic()</code> composable to access user psychology:
      </p>

      <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-6 mb-6 not-prose">
        <pre className="bg-black rounded p-4 text-xs text-[#10b981] overflow-x-auto">
{`<script setup>
import { usePsychographic } from '@knxw/sdk/vue';

const psychographic = usePsychographic();

// Access psychographic data
console.log(psychographic.profile);
console.log(psychographic.getTopMotivation());
console.log(psychographic.getRiskProfile());
console.log(psychographic.getCognitiveStyle());

// Check conditions
if (psychographic.hasMotivation('achievement')) {
  console.log('User is achievement-motivated');
}

// Refresh profile
const refreshProfile = () => {
  psychographic.refresh();
};
</script>`}
        </pre>
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Adaptive Components</h4>

      <div className="space-y-6 mb-8">
        {/* AdaptiveButton */}
        <div className="bg-[#111111] border border-[#262626] rounded-lg p-6">
          <h5 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#42b883]" />
            AdaptiveButton
          </h5>
          <p className="text-sm text-[#a3a3a3] mb-4">
            Button component that adapts text based on user psychology
          </p>
          <pre className="bg-black rounded p-4 text-xs text-[#10b981] overflow-x-auto">
{`<template>
  <AdaptiveButton
    baseText="Get Started"
    :motivationVariants="{
      achievement: 'Start Winning Now',
      security: 'Try Risk-Free',
      innovation: 'Be First to Try'
    }"
    :riskVariants="{
      conservative: 'Safe Trial',
      moderate: 'Get Started',
      aggressive: 'Instant Access'
    }"
    class="btn btn-primary"
    @click="handleClick"
  />
</template>

<script setup>
import { AdaptiveButton } from '@knxw/sdk/vue';

const handleClick = () => {
  console.log('Button clicked');
};
</script>`}
          </pre>
        </div>

        {/* AdaptiveText */}
        <div className="bg-[#111111] border border-[#262626] rounded-lg p-6">
          <h5 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#42b883]" />
            AdaptiveText
          </h5>
          <p className="text-sm text-[#a3a3a3] mb-4">
            Text element that adapts content based on psychographics
          </p>
          <pre className="bg-black rounded p-4 text-xs text-[#10b981] overflow-x-auto">
{`<template>
  <AdaptiveText
    baseText="Premium Features"
    :motivationVariants="{
      achievement: 'Elite Performance Tools',
      security: 'Trusted Enterprise Features',
      mastery: 'Advanced Professional Tools'
    }"
    as="h2"
    class="heading"
  />
</template>

<script setup>
import { AdaptiveText } from '@knxw/sdk/vue';
</script>`}
          </pre>
        </div>

        {/* AdaptiveContainer */}
        <div className="bg-[#111111] border border-[#262626] rounded-lg p-6">
          <h5 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#42b883]" />
            AdaptiveContainer
          </h5>
          <p className="text-sm text-[#a3a3a3] mb-4">
            Conditionally render content based on psychographic criteria
          </p>
          <pre className="bg-black rounded p-4 text-xs text-[#10b981] overflow-x-auto">
{`<template>
  <!-- Show only to conservative users -->
  <AdaptiveContainer 
    :showFor="{ riskProfile: 'conservative' }"
  >
    <div class="trust-badges">
      <Badge>Money-Back Guarantee</Badge>
      <Badge>SSL Encrypted</Badge>
    </div>
  </AdaptiveContainer>

  <!-- Show to achievement-motivated users -->
  <AdaptiveContainer 
    :showFor="{ motivations: ['achievement', 'mastery'] }"
  >
    <Leaderboard />
  </AdaptiveContainer>

  <!-- Hide from analytical users -->
  <AdaptiveContainer 
    :hideFor="{ cognitiveStyle: 'analytical' }"
  >
    <EmotionalStorytelling />
  </AdaptiveContainer>
</template>

<script setup>
import { AdaptiveContainer } from '@knxw/sdk/vue';
</script>`}
          </pre>
        </div>
      </div>

      <h4 className="text-xl font-semibold text-white mb-4">Complete Example</h4>

      <div className="bg-[#0a0a0a] border border-[#262626] rounded-lg p-6 mb-6 not-prose">
        <pre className="bg-black rounded p-4 text-xs text-[#10b981] overflow-x-auto">
{`<template>
  <div class="product-card">
    <!-- Adaptive headline -->
    <AdaptiveText
      baseText="Premium Wireless Headphones"
      :motivationVariants="{
        achievement: 'Award-Winning Pro Audio',
        innovation: 'Next-Gen Audio Technology',
        security: 'Trusted by 1M+ Customers'
      }"
      as="h3"
      class="product-title"
    />

    <!-- Adaptive description -->
    <AdaptiveText
      baseText="High-quality audio with noise cancellation"
      :motivationVariants="{
        achievement: 'Studio-grade sound for professionals',
        innovation: 'Revolutionary spatial audio',
        security: '2-year warranty, hassle-free returns'
      }"
      class="product-description"
    />

    <!-- Show trust signals to conservative users -->
    <AdaptiveContainer :showFor="{ riskProfile: 'conservative' }">
      <div class="trust-badges">
        <Badge>Free Returns</Badge>
        <Badge>2-Year Warranty</Badge>
      </div>
    </AdaptiveContainer>

    <!-- Adaptive CTA -->
    <AdaptiveButton
      baseText="Add to Cart"
      :riskVariants="{
        conservative: 'Try Risk-Free',
        moderate: 'Add to Cart',
        aggressive: 'Buy Now - Limited Stock'
      }"
      class="cta-button"
      @click="addToCart"
    />
  </div>
</template>

<script setup>
import { 
  AdaptiveButton, 
  AdaptiveText, 
  AdaptiveContainer,
  usePsychographic 
} from '@knxw/sdk/vue';

const psychographic = usePsychographic();

const addToCart = () => {
  console.log('Adding to cart for user with motivation:', 
    psychographic.getTopMotivation());
  // Add to cart logic
};
</script>

<style scoped>
.product-card {
  padding: 2rem;
  border: 1px solid #333;
  border-radius: 1rem;
}
</style>`}
        </pre>
      </div>

      <div className="bg-gradient-to-br from-[#42b883]/10 to-[#00d4ff]/10 border border-[#42b883]/30 rounded-lg p-6 mb-6">
        <h5 className="text-sm font-semibold text-[#42b883] mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Feature Parity
        </h5>
        <p className="text-sm text-[#a3a3a3] mb-3">
          The Vue.js SDK provides complete feature parity with the React implementation:
        </p>
        <ul className="space-y-1 text-sm text-[#e5e5e5]">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-[#42b883] flex-shrink-0" />
            Same psychographic data structure and API
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-[#42b883] flex-shrink-0" />
            Identical adaptive component behavior
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-[#42b883] flex-shrink-0" />
            Real-time profile updates and reactivity
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-[#42b883] flex-shrink-0" />
            TypeScript support (coming soon)
          </li>
        </ul>
      </div>

      <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/30 rounded-lg p-6">
        <h5 className="text-sm font-semibold text-[#fbbf24] mb-3">
          API Documentation
        </h5>
        <p className="text-sm text-[#a3a3a3]">
          For complete API reference, type definitions, and advanced usage patterns, visit the{' '}
          <a href="https://docs.knxw.com/sdk/vue" className="text-[#42b883] hover:underline">
            Vue SDK documentation
          </a>.
        </p>
      </div>
    </div>
  );
}