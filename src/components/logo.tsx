
import { cn } from '@/lib/utils';
import Image from 'next/image';

type LogoProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'small';
};

export function Logo({ className, variant = 'default', ...props }: LogoProps) {
  const isSmall = variant === 'small';
  const size = isSmall ? 32 : 40;

  return (
    <div className={cn("flex items-center gap-2 sm:gap-3", className)} {...props}>
      <Image
        src="/logo.jpeg"
        alt="Code Yapp Logo"
        width={size}
        height={size}
        className={cn(isSmall ? 'h-8 w-8' : 'h-10 w-10')}
      />
      <span
        className={cn(
          'font-headline font-bold text-primary',
          isSmall ? 'text-2xl' : 'text-4xl'
        )}
      >
        Code Yapp
      </span>
    </div>
  );
}
