import type { UserPlan } from '@/lib/dashboard/constants'

export { USER_FREE_ROASTS } from '@/lib/dashboard/constants'

/**
 * Dashboard signed-in roasts: lifetime cap per account (`user_usage.roasts_used`).
 * Does not reset monthly — distinct from anonymous device limits in lib/usage.ts.
 */
export function dashboardRoastLimitHint(plan: UserPlan, limit: number): string {
  if (plan === 'pro') {
    return 'Unlimited roasts on your Pro plan'
  }
  return `Free forever — ${limit} roasts total per account, then upgrade for unlimited`
}

export function dashboardRoastLimitLabel(usesLeft: number, plan: UserPlan): string {
  if (plan === 'pro') {
    return 'Unlimited roasts'
  }
  return `${usesLeft} roast${usesLeft === 1 ? '' : 's'} left`
}
