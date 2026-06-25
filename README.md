# 🔥 RoastMyCV.in

AI-powered brutally honest Hinglish resume roaster. Built with Next.js + Claude API.

## Setup (5 minutes)

```bash
npm install
cp .env.local.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel (free, 2 minutes)

1. Push to GitHub
2. Go to vercel.com → Import repo
3. Add env var: `ANTHROPIC_API_KEY` = your key
4. Deploy → Done

Custom domain: roastmycv.in → add in Vercel dashboard

## Add Razorpay Paywall

1. Create account at razorpay.com
2. Get your Key ID from dashboard
3. Replace the "Razorpay se unlock karo" button in page.tsx with:

```js
const options = {
  key: 'YOUR_RAZORPAY_KEY',
  amount: 4900, // ₹49 in paise
  currency: 'INR',
  name: 'RoastMyCV.in',
  description: 'Unlimited Resume Roasts',
  handler: function(response) {
    // Set unlimited in localStorage
    localStorage.setItem('roast_uses_left', '999')
    localStorage.setItem('roast_paid', 'true')
    setUsesLeft(999)
    setShowPaywall(false)
  }
}
const rzp = new window.Razorpay(options)
rzp.open()
```

Add to layout.tsx head: `<script src="https://checkout.razorpay.com/v1/checkout.js"></script>`

## Viral Launch Checklist

- [ ] Deploy to Vercel
- [ ] Connect domain
- [ ] Test with your own resume
- [ ] Screenshot your roast result
- [ ] Post on LinkedIn with caption: "AI ne mera resume jala diya 💀 Score: X/10. Try karo free 👉 roastmycv.in"
- [ ] Post in 20 WhatsApp groups
- [ ] Post on r/india and r/indianstartups
- [ ] Twitter thread: "I roasted 10 Indian resumes with AI 🧵"

## Stack
- Next.js 14
- Claude Sonnet (claude-sonnet-4-6)
- Tailwind CSS
- pdf-parse for PDF extraction
- localStorage for free tier tracking
