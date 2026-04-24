import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  collapsed?: boolean
}

export default function Logo({ className, collapsed = false }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-3 select-none', className)}>
      {/* Shield icon */}
      <svg
        viewBox="0 0 40 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-9 shrink-0"
        aria-hidden="true"
      >
        {/* Outer shield */}
        <path
          d="M20 2L36 7.5V20C36 29.5 29 37.5 20 41C11 37.5 4 29.5 4 20V7.5L20 2Z"
          fill="#C8962A"
        />
        {/* Inner shield cutout */}
        <path
          d="M20 6.5L32 11V20C32 27.5 26.5 34.2 20 37.2C13.5 34.2 8 27.5 8 20V11L20 6.5Z"
          fill="#0A1520"
        />
        {/* Location pin — dot */}
        <circle cx="20" cy="24" r="3" fill="#C8962A" />
        {/* Location pin — stem */}
        <line
          x1="20" y1="21" x2="20" y2="15"
          stroke="#C8962A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Signal arc outer */}
        <path
          d="M13.5 13.5 A9 9 0 0 1 26.5 13.5"
          stroke="#C8962A"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
        {/* Signal arc inner */}
        <path
          d="M15.8 15.5 A6 6 0 0 1 24.2 15.5"
          stroke="#C8962A"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
      </svg>

      {/* Wordmark */}
      {!collapsed && (
        <div className="flex flex-col leading-none">
          <span
            className="text-[17px] font-semibold tracking-[0.18em] text-foreground uppercase"
            style={{ fontFamily: 'Oswald, system-ui, sans-serif' }}
          >
            CENTRAL
          </span>
          <span
            className="text-[11px] font-bold tracking-[0.22em] text-primary uppercase mt-[3px]"
            style={{ fontFamily: 'Barlow Condensed, system-ui, sans-serif' }}
          >
            RASTREIO
          </span>
        </div>
      )}
    </div>
  )
}
