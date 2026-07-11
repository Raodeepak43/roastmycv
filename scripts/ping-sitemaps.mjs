#!/usr/bin/env node
/** Ping search engines after sitemap changes. */
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mycvroast.in').replace(/\/$/, '')
const SITEMAP = `${SITE}/sitemap.xml`

const PING_URLS = [
  `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP)}`,
  `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP)}`,
]

async function ping(url) {
  try {
    const res = await fetch(url)
    console.log(res.ok ? '✓' : '✗', res.status, url.split('?')[0])
  } catch (err) {
    console.error('✗', url.split('?')[0], err instanceof Error ? err.message : err)
  }
}

console.log('Pinging sitemap:', SITEMAP)
await Promise.all(PING_URLS.map(ping))
