'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function NavLink({ href, children, icon, className }: NavLinkProps) {
  const pathname = usePathname();
  
  const isActive = pathname === href || 
    (href !== '/' && pathname.startsWith(href));

  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      className={cn(
        "w-full justify-start",
        isActive && "bg-primary text-primary-foreground",
        className
      )}
    >
      {icon && <span className="mr-3">{icon}</span>}
      {children}
    </Button>
  );
}