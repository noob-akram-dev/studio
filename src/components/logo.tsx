import { cn } from '@/lib/utils';

export function Logo({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center gap-4", className)} {...props}>
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0" y1="0" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#A7F3D0' }} />
            <stop offset="100%" style={{ stopColor: '#34D399' }} />
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
          stroke="#A7F3D0"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M28 16L32 20L28 24"
          stroke="#A7F3D0"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-headline text-4xl font-bold text-primary">
        Code Yapp
      </span>
    </div>
  );
}
