// Vue SDK component source code, stored as strings so they aren't parsed by the React build.
// Use these in documentation or copy-paste snippets for Vue developers integrating the Knxw SDK.

export const AdaptiveButtonVueSource = `<template>
  <button :class="className" @click="$emit('click', $event)">
    {{ adaptedText }}
  </button>
</template>

<script setup>
import { computed } from 'vue';
import { usePsychographic } from './PsychographicProvider';

const props = defineProps({
  baseText: { type: String, required: true },
  motivationVariants: { type: Object, default: () => ({}) },
  riskVariants: { type: Object, default: () => ({}) },
  cognitiveStyleVariants: { type: Object, default: () => ({}) },
  className: { type: String, default: '' }
});

defineEmits(['click']);

const psychographic = usePsychographic();

const adaptedText = computed(() => {
  if (psychographic.loading || !psychographic.profile) return props.baseText;
  const topMotivation = psychographic.getTopMotivation();
  if (topMotivation && props.motivationVariants[topMotivation]) return props.motivationVariants[topMotivation];
  const riskProfile = psychographic.getRiskProfile();
  if (riskProfile && props.riskVariants[riskProfile]) return props.riskVariants[riskProfile];
  const cognitiveStyle = psychographic.getCognitiveStyle();
  if (cognitiveStyle && props.cognitiveStyleVariants[cognitiveStyle]) return props.cognitiveStyleVariants[cognitiveStyle];
  return props.baseText;
});
</script>`;

export const AdaptiveContainerVueSource = `<template>
  <div v-if="shouldShow"><slot /></div>
</template>

<script setup>
import { computed } from 'vue';
import { usePsychographic } from './PsychographicProvider';

const props = defineProps({
  showFor: { type: Object, default: () => ({}) },
  hideFor: { type: Object, default: () => ({}) }
});

const psychographic = usePsychographic();

const shouldShow = computed(() => {
  if (psychographic.loading || !psychographic.profile) return false;
  if (Object.keys(props.hideFor).length > 0 && psychographic.matchesProfile(props.hideFor)) return false;
  if (Object.keys(props.showFor).length > 0) return psychographic.matchesProfile(props.showFor);
  return true;
});
</script>`;

export const AdaptiveTextVueSource = `<template>
  <component :is="as" :class="className">{{ adaptedText }}</component>
</template>

<script setup>
import { computed } from 'vue';
import { usePsychographic } from './PsychographicProvider';

const props = defineProps({
  baseText: { type: String, required: true },
  motivationVariants: { type: Object, default: () => ({}) },
  riskVariants: { type: Object, default: () => ({}) },
  moodVariants: { type: Object, default: () => ({}) },
  cognitiveStyleVariants: { type: Object, default: () => ({}) },
  as: { type: String, default: 'span' },
  className: { type: String, default: '' }
});

const psychographic = usePsychographic();

const adaptedText = computed(() => {
  if (psychographic.loading || !psychographic.profile) return props.baseText;
  const topMotivation = psychographic.getTopMotivation();
  if (topMotivation && props.motivationVariants[topMotivation]) return props.motivationVariants[topMotivation];
  const mood = psychographic.getMood();
  if (mood && props.moodVariants[mood]) return props.moodVariants[mood];
  const riskProfile = psychographic.getRiskProfile();
  if (riskProfile && props.riskVariants[riskProfile]) return props.riskVariants[riskProfile];
  const cognitiveStyle = psychographic.getCognitiveStyle();
  if (cognitiveStyle && props.cognitiveStyleVariants[cognitiveStyle]) return props.cognitiveStyleVariants[cognitiveStyle];
  return props.baseText;
});
</script>`;