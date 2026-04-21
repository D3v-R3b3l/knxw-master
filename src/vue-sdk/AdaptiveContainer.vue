<template>
  <div v-if="shouldShow">
    <slot />
  </div>
</template>

<script setup>
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

  if (Object.keys(props.hideFor).length > 0) {
    if (psychographic.matchesProfile(props.hideFor)) {
      return false;
    }
  }

  if (Object.keys(props.showFor).length > 0) {
    return psychographic.matchesProfile(props.showFor);
  }

  return true;
});
</script>