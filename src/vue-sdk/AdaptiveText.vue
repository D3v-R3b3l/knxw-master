<template>
  <component 
    :is="as"
    :class="className"
  >
    {{ adaptedText }}
  </component>
</template>

<script setup>
import { computed } from 'vue';
import { usePsychographic } from './PsychographicProvider';

const props = defineProps({
  baseText: {
    type: String,
    required: true
  },
  motivationVariants: {
    type: Object,
    default: () => ({})
  },
  riskVariants: {
    type: Object,
    default: () => ({})
  },
  moodVariants: {
    type: Object,
    default: () => ({})
  },
  cognitiveStyleVariants: {
    type: Object,
    default: () => ({})
  },
  as: {
    type: String,
    default: 'span'
  },
  className: {
    type: String,
    default: ''
  }
});

const psychographic = usePsychographic();

const adaptedText = computed(() => {
  if (psychographic.loading || !psychographic.profile) {
    return props.baseText;
  }

  const topMotivation = psychographic.getTopMotivation();
  if (topMotivation && props.motivationVariants[topMotivation]) {
    return props.motivationVariants[topMotivation];
  }

  const mood = psychographic.getMood();
  if (mood && props.moodVariants[mood]) {
    return props.moodVariants[mood];
  }

  const riskProfile = psychographic.getRiskProfile();
  if (riskProfile && props.riskVariants[riskProfile]) {
    return props.riskVariants[riskProfile];
  }

  const cognitiveStyle = psychographic.getCognitiveStyle();
  if (cognitiveStyle && props.cognitiveStyleVariants[cognitiveStyle]) {
    return props.cognitiveStyleVariants[cognitiveStyle];
  }

  return props.baseText;
});
</script>