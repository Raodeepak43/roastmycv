import toolLandings from '@/data/seo/tool-landings.json'
import roleCheckers from '@/data/seo/role-checkers.json'
import type { RoleCheckerConfig, ToolLandingConfig } from '@/lib/seo-pages/types'

export const TOOL_LANDINGS = toolLandings as ToolLandingConfig[]
export const ROLE_CHECKERS = roleCheckers as RoleCheckerConfig[]

export function getToolLandingBySlug(slug: string): ToolLandingConfig | undefined {
  return TOOL_LANDINGS.find((p) => p.slug === slug)
}

export function getRoleCheckerBySlug(slug: string): RoleCheckerConfig | undefined {
  return ROLE_CHECKERS.find((p) => p.slug === slug)
}

export function getAllToolLandingSlugs(): string[] {
  return TOOL_LANDINGS.map((p) => p.slug)
}

export function getAllRoleCheckerSlugs(): string[] {
  return ROLE_CHECKERS.map((p) => p.slug)
}

export function getAllSeoSitemapEntries(): { url: string; lastModified: Date; priority: number }[] {
  const now = new Date()
  return [
    ...TOOL_LANDINGS.map((p) => ({
      url: `/${p.slug}`,
      lastModified: now,
      priority: 0.85,
    })),
    ...ROLE_CHECKERS.map((p) => ({
      url: `/resume-checker/${p.slug}`,
      lastModified: now,
      priority: 0.8,
    })),
  ]
}
