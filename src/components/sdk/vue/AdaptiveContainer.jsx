<template>
  <div v-if="shouldShow">
    <slot />
  </div>
</template>

<script setup>
/**
 * AdaptiveContainer - Vue Component
 * Conditionally renders content based on psychographic criteria
 * 
 * Usage:
 * <AdaptiveContainer 
 *   :showFor="{ motivations: ['achievement'], riskProfile: 'aggressive' }"
 * >
 *   <p>Content for achievement-motivated, aggressive users</p>
 * </AdaptiveContainer>
 */

import { computed } from 'vue';
import { usePsychographic } from './PsychographicProvider';

const props = defineProps({
  showFor: {
    type: Object,
    default: () => ({})
  },
  hideFor: {
    type: Object,
    default: () => ({})
  }
});

const psychographic = usePsychographic();

const shouldShow = computed(() => {
  if (psychographic.loading || !psychographic.profile) {
    return false;
  }

  // Check hideFor conditions first
  if (Object.keys(props.hideFor).length > 0) {
    if (psychographic.matchesProfile(props.hideFor)) {
      return false;
    }
  }

  // Check showFor conditions
  if (Object.keys(props.showFor).length > 0) {
    return psychographic.matchesProfile(props.showFor);
  }

  // Default to showing if no conditions specified
  return true;
});
</script>