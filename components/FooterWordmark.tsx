import { Logo } from '@/components/Logo'

export function FooterWordmark() {
  return (
    <div className="footer-brand-wrap footer-brand-wrap--reveal" aria-label="MyCVRoast">
      <h2 className="sr-only">MyCVRoast</h2>
      <div className="footer-brand-reveal-inner flex justify-center">
        <Logo
          variant="dark"
          href="/"
          imageClassName="h-10 w-auto max-w-[min(100%,280px)] md:h-12"
        />
      </div>
    </div>
  )
}
