import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ButtonProps } from '@/components/ui/button';
import { forwardRef } from 'react';

interface LinkButtonProps extends ButtonProps {
  href: string;
  children: React.ReactNode;
}

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ href, children, className, ...props }, ref) => {
    return (
      <Link href={href} className={className} ref={ref}>
        <Button {...props}>
          {children}
        </Button>
      </Link>
    );
  }
);

LinkButton.displayName = 'LinkButton';
