import { GA_MEASUREMENT_ID } from '@/lib/analytics'

/** Inline gtag bootstrap — must live in <head> on every page (Google Analytics install). */
export function googleAnalyticsHeadScripts(measurementId: string = GA_MEASUREMENT_ID): string {
  return `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500
});
gtag('config', '${measurementId}');
`.trim()
}
