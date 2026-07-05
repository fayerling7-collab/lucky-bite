'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-bold transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-b from-sky-soft to-sky-deep text-white shadow-pop hover:brightness-105',
        pink:
          'bg-gradient-to-b from-blush to-coral text-white shadow-pop hover:brightness-105',
        mint:
          'bg-gradient-to-b from-mint to-mint text-emerald-700 shadow-pop hover:brightness-105',
        butter:
          'bg-gradient-to-b from-butter to-butter text-amber-700 shadow-pop hover:brightness-105',
        lavender:
          'bg-gradient-to-b from-lavender to-lavender text-purple-700 shadow-pop hover:brightness-105',
        ghost: 'bg-white/60 text-slate-600 hover:bg-white/80 backdrop-blur',
        outline:
          'border-2 border-sky-soft bg-white/50 text-sky-deep hover:bg-sky-soft/20',
        danger:
          'bg-gradient-to-b from-coral to-blush text-white shadow-pop hover:brightness-105',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-12 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
        icon: 'h-12 w-12',
        fab: 'h-16 w-16 text-2xl',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
