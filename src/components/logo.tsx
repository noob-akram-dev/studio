
import { cn } from '@/lib/utils';
import Image from 'next/image';

type LogoProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'small';
};

export function Logo({ className, variant = 'default', ...props }: LogoProps) {
  const isSmall = variant === 'small';

  return (
    <div className={cn("flex items-center gap-2 sm:gap-3", className)} {...props}>
      <Image
        src="/logo.png"
        alt="Code Yapp Logo"
        width={isSmall ? 32 : 64}
        height={isSmall ? 32 : 64}
        className={cn(isSmall ? 'h-8 w-8' : 'h-12 w-12 sm:h-16 sm:w-16')}
      />
      <span
        className={cn(
          'font-headline font-bold text-primary',
          isSmall ? 'text-2xl hidden sm:inline' : 'text-4xl sm:text-6xl'
        )}
      >
        Code Yapp
      </span>
    </div>
  );
}
