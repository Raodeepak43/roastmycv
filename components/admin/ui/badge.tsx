import { cn } from '@/lib/utils'

export function AdminBadge({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'secondary' | 'outline' | 'success' }) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variant === 'default' && 'border-transparent bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]',
        variant === 'secondary' && 'border-transparent bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]',
        variant === 'outline' && 'text-[hsl(var(--foreground))]',
        variant === 'success' && 'border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
        className,
      )}
      {...props}
    />
  )
}
