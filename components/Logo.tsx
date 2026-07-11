import Image from 'next/image'
import Link from 'next/link'

export type LogoVariant = 'light' | 'dark' | 'mark'

const LOGO_SRC: Record<LogoVariant, string> = {
  light: '/brand/logo-saas-light.svg',
  dark: '/brand/logo-saas-dark.svg',
  mark: '/brand/mark-saas.svg',
}

const LOGO_DIM: Record<LogoVariant, { width: number; height: number }> = {
  light: { width: 132, height: 32 },
  dark: { width: 132, height: 32 },
  mark: { width: 32, height: 32 },
}

type LogoProps = {
  variant?: LogoVariant
  /** Set to false to render without a home link (e.g. share cards). */
  href?: string | false
  className?: string
  imageClassName?: string
  priority?: boolean
  onClick?: () => void
}

export function Logo({
  variant = 'dark',
  href = '/',
  className = '',
  imageClassName = '',
  priority,
  onClick,
}: LogoProps) {
  const src = LOGO_SRC[variant]
  const { width, height } = LOGO_DIM[variant]
  const defaultImageClass =
    variant === 'mark' ? 'h-8 w-8' : 'h-7 w-auto max-w-[140px] sm:max-w-[160px]'

  const img = (
    <Image
      src={src}
      alt="MyCVRoast"
      width={width}
      height={height}
      className={imageClassName || defaultImageClass}
      priority={priority}
    />
  )

  const wrapClass = `inline-flex shrink-0 items-center ${className}`.trim()

  if (href === false) {
    return <span className={wrapClass}>{img}</span>
  }

  return (
    <Link href={href} onClick={onClick} className={wrapClass} aria-label="MyCVRoast home">
      {img}
    </Link>
  )
}
