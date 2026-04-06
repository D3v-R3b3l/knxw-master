/**
 * knXw Adaptive UI SDK - Vue.js
 * 
 * Psychographic intelligence for Vue applications
 * 
 * @example
 * // main.js
 * import { createApp } from 'vue';
 * import { createPsychographicProvider } from '@knxw/sdk/vue';
 * import App from './App.vue';
 * 
 * const app = createApp(App);
 * 
 * app.use(createPsychographicProvider({
 *   apiKey: 'your-knxw-api-key',
 *   userId: 'user-123',
 *   useMockData: false // Set to true for development
 * }));
 * 
 * app.mount('#app');
 * 
 * @example
 * // Component.vue
 * <template>
 *   <AdaptiveButton
 *     baseText="Get Started"
 *     :motivationVariants="{
 *       achievement: 'Start Winning',
 *       security: 'Try Risk-Free'
 *     }"
 *     @click="handleClick"
 *   />
 * </template>
 * 
 * <script setup>
 * import { AdaptiveButton, usePsychographic } from '@knxw/sdk/vue';
 * 
 * const psychographic = usePsychographic();
 * 
 * const handleClick = () => {
 *   console.log('User motivation:', psychographic.getTopMotivation());
 * };
 * </script>
 */

export { createPsychographicProvider, usePsychographic } from './PsychographicProvider';
export { default as AdaptiveButton } from './AdaptiveButton.vue';
export { default as AdaptiveText } from './AdaptiveText.vue';
export { default as AdaptiveContainer } from './AdaptiveContainer.vue';