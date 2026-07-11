/**
 * Print this machine's outbound IP for Careerjet partner dashboard whitelisting.
 * Run locally before dev, and on Vercel (or check Vercel Static IPs for production).
 *
 * Usage: npm run jobs:careerjet-ip
 */

const IP_SERVICES = [
  'https://ifconfig.me/ip',
  'https://api.ipify.org',
]

async function fetchOutboundIp() {
  for (const url of IP_SERVICES) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15_000) })
      if (!res.ok) continue
      const ip = (await res.text()).trim()
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) return ip
    } catch {
      // try next service
    }
  }
  return null
}

const ip = await fetchOutboundIp()

console.log('')
console.log('Careerjet IP whitelist setup')
console.log('==============================')
console.log('')
if (ip) {
  console.log(`Outbound IP from this environment: ${ip}`)
} else {
  console.log('Could not detect outbound IP automatically.')
}
console.log('')
console.log('1. Register at https://www.careerjet.com/partners/')
console.log('2. Open your publisher dashboard → add server IP(s) (max 8)')
console.log('3. Add CAREERJET_API_KEY to .env.local (and Vercel env vars)')
console.log('')
console.log('Important:')
console.log('- Careerjet whitelists the IP that CALLS their API (your server), not visitors.')
console.log('- Local dev: run this script on your machine and whitelist that IP.')
console.log('- Vercel: enable Static IPs (Pro) or whitelist each egress IP you see in logs.')
console.log('- Without a whitelisted IP, searches return "unauthorized access from ip".')
console.log('')
