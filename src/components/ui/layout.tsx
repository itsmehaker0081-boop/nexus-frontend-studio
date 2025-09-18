import React from 'react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const AppLayout: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {children}
    </div>
  );
};

export const Container: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <div className={cn("container mx-auto px-4 py-6", className)}>
      {children}
    </div>
  );
};

export const Card: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <div className={cn(
      "bg-card rounded-xl p-6 shadow-card border border-border transition-smooth hover:shadow-lg",
      className
    )}>
      {children}
    </div>
  );
};

export const GlassCard: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <div className={cn(
      "glass rounded-xl p-6 transition-smooth hover:bg-white/20",
      className
    )}>
      {children}
    </div>
  );
};