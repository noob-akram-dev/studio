
import { cn } from '@/lib/utils';

type LogoProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'small';
};

export function Logo({ className, variant = 'default', ...props }: LogoProps) {
  const isSmall = variant === 'small';
  return (
    <div className={cn("flex items-center gap-2 sm:gap-4", className)} {...props}>
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(isSmall ? 'h-8 w-8 sm:h-10 sm:w-10' : 'h-12 w-12')}
      >
        <defs>
          <linearGradient id="logoGradient" x1="0" y1="0" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))' }} />
            <stop offset="100%" style={{ stopColor: 'hsl(var(--primary) / 0.6)' }} />
          </linearGradient>
        </defs>
        <path
          d="M10 4H38C39.1046 4 40 4.89543 40 6V30C40 31.1046 39.1046 32 38 32H28L18 42V32H10C8.89543 32 8 31.1046 8 30V6C8 4.89543 8.89543 4 10 4Z"
          fill="url(#logoGradient)"
          fillOpacity="0.2"
        />
        <path
          d="M10 4H38C39.1046 4 40 4.89543 40 6V30C40 31.1046 39.1046 32 38 32H28L18 42V32H10C8.89543 32 8 31.1046 8 30V6C8 4.89543 8.89543 4 10 4Z"
          stroke="url(#logoGradient)"
          strokeWidth="2"
        />
        <path
          d="M20 16L16 20L20 24"
          stroke="hsl(var(--primary))"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M28 16L32 20L28 24"
          stroke="hsl(var(--primary))"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className={cn(
          'font-headline font-bold text-primary',
          isSmall ? 'text-2xl sm:text-3xl' : 'text-4xl'
        )}
      >
        Code Yapp
      </span>
    </div>
  );
}
