import type { Metadata } from 'next'
import { getPublicRoastByToken } from '@/lib/public-roasts'
import { NOINDEX_ROBOTS, pageMetadata } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const roast = await getPublicRoastByToken(params.id)

  if (!roast || !roast.is_public) {
    return {
      title: 'Roast not available | MyCVRoast',
      robots: NOINDEX_ROBOTS,
    }
  }

  const firstIssue = roast.top_issues[0] ?? 'AI found resume issues worth fixing'

  return pageMetadata({
    title: `My CV got roasted — ${roast.score}/10 💀 | MyCVRoast`,
    description: firstIssue,
    path: `/roast/${params.id}`,
  })
}

export default function RoastResultLayout({ children }: { children: React.ReactNode }) {
  return children
}
