// Vue 3 SDK component source code for documentation purposes.
// Stored as concatenated strings to prevent the build system from treating them as JSX.

const t = (s) => s; // identity — just returns the string

export const AdaptiveButtonVueSource = t(
  '<template>\n' +
  '  <button :class="className" @click="$emit(\'click\', $event)">\n' +
  '    {{ adaptedText }}\n' +
  '  </button>\n' +
  '</template>\n\n' +
  '<script setup>\n' +
  'import { computed } from \'vue\';\n' +
  'import { usePsychographic } from \'./PsychographicProvider\';\n\n' +
  'const props = defineProps({\n' +
  '  baseText: { type: String, required: true },\n' +
  '  motivationVariants: { type: Object, default: () => ({}) },\n' +
  '  riskVariants: { type: Object, default: () => ({}) },\n' +
  '  cognitiveStyleVariants: { type: Object, default: () => ({}) },\n' +
  '  className: { type: String, default: \'\' }\n' +
  '});\n\n' +
  'defineEmits([\'click\']);\n\n' +
  'const psychographic = usePsychographic();\n\n' +
  'const adaptedText = computed(() => {\n' +
  '  if (psychographic.loading || !psychographic.profile) return props.baseText;\n' +
  '  const topMotivation = psychographic.getTopMotivation();\n' +
  '  if (topMotivation && props.motivationVariants[topMotivation]) return props.motivationVariants[topMotivation];\n' +
  '  const riskProfile = psychographic.getRiskProfile();\n' +
  '  if (riskProfile && props.riskVariants[riskProfile]) return props.riskVariants[riskProfile];\n' +
  '  const cognitiveStyle = psychographic.getCognitiveStyle();\n' +
  '  if (cognitiveStyle && props.cognitiveStyleVariants[cognitiveStyle]) return props.cognitiveStyleVariants[cognitiveStyle];\n' +
  '  return props.baseText;\n' +
  '});\n' +
  '<\/script>'
);

export const AdaptiveContainerVueSource = t(
  '<template>\n' +
  '  <div v-if="shouldShow"><slot /></div>\n' +
  '</template>\n\n' +
  '<script setup>\n' +
  'import { computed } from \'vue\';\n' +
  'import { usePsychographic } from \'./PsychographicProvider\';\n\n' +
  'const props = defineProps({\n' +
  '  showFor: { type: Object, default: () => ({}) },\n' +
  '  hideFor: { type: Object, default: () => ({}) }\n' +
  '});\n\n' +
  'const psychographic = usePsychographic();\n\n' +
  'const shouldShow = computed(() => {\n' +
  '  if (psychographic.loading || !psychographic.profile) return false;\n' +
  '  if (Object.keys(props.hideFor).length > 0 && psychographic.matchesProfile(props.hideFor)) return false;\n' +
  '  if (Object.keys(props.showFor).length > 0) return psychographic.matchesProfile(props.showFor);\n' +
  '  return true;\n' +
  '});\n' +
  '<\/script>'
);

export const AdaptiveTextVueSource = t(
  '<template>\n' +
  '  <component :is="as" :class="className">{{ adaptedText }}</component>\n' +
  '</template>\n\n' +
  '<script setup>\n' +
  'import { computed } from \'vue\';\n' +
  'import { usePsychographic } from \'./PsychographicProvider\';\n\n' +
  'const props = defineProps({\n' +
  '  baseText: { type: String, required: true },\n' +
  '  motivationVariants: { type: Object, default: () => ({}) },\n' +
  '  riskVariants: { type: Object, default: () => ({}) },\n' +
  '  moodVariants: { type: Object, default: () => ({}) },\n' +
  '  cognitiveStyleVariants: { type: Object, default: () => ({}) },\n' +
  '  as: { type: String, default: \'span\' },\n' +
  '  className: { type: String, default: \'\' }\n' +
  '});\n\n' +
  'const psychographic = usePsychographic();\n\n' +
  'const adaptedText = computed(() => {\n' +
  '  if (psychographic.loading || !psychographic.profile) return props.baseText;\n' +
  '  const topMotivation = psychographic.getTopMotivation();\n' +
  '  if (topMotivation && props.motivationVariants[topMotivation]) return props.motivationVariants[topMotivation];\n' +
  '  const mood = psychographic.getMood();\n' +
  '  if (mood && props.moodVariants[mood]) return props.moodVariants[mood];\n' +
  '  const riskProfile = psychographic.getRiskProfile();\n' +
  '  if (riskProfile && props.riskVariants[riskProfile]) return props.riskVariants[riskProfile];\n' +
  '  const cognitiveStyle = psychographic.getCognitiveStyle();\n' +
  '  if (cognitiveStyle && props.cognitiveStyleVariants[cognitiveStyle]) return props.cognitiveStyleVariants[cognitiveStyle];\n' +
  '  return props.baseText;\n' +
  '});\n' +
  '<\/script>'
);