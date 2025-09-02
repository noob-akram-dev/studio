
import { cn } from '@/lib/utils';
import Image from 'next/image';

type LogoProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'small';
};

export function Logo({ className, variant = 'default', ...props }: LogoProps) {
  const isSmall = variant === 'small';
  const size = isSmall ? 32 : 80; // Increased default size

  return (
    <div className={cn("flex items-center gap-2 sm:gap-3", className)} {...props}>
      <Image
        src="/logo.png"
        alt="Code Yapp Logo"
        width={size}
        height={size}
        className={cn(isSmall ? 'h-8 w-8' : 'h-20 w-20')} // Increased default size
      />
      <span
        className={cn(
          'font-headline font-bold text-primary',
          isSmall ? 'text-2xl' : 'text-6xl' // Increased default font size
        )}
      >
        Code Yapp
      </span>
    </div>
  );
}
