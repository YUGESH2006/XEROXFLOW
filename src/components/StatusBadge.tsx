import { Clock, CheckCircle2, PackageCheck, Printer } from 'lucide-react';
import { OrderStatus } from '../types';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  let bgClass = 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
  let Icon = Clock;
  let label = 'Pending';

  switch (status) {
    case 'Pending':
      bgClass = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60';
      Icon = Clock;
      label = 'Pending';
      break;
    case 'Printing':
      bgClass = 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60';
      Icon = Printer;
      label = 'Printing';
      break;
    case 'Completed':
      bgClass = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60';
      Icon = CheckCircle2;
      label = 'Ready for Pickup';
      break;
    case 'Issued':
      bgClass = 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60';
      Icon = PackageCheck;
      label = 'Issued';
      break;
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs sm:text-sm gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm sm:text-base gap-2',
  }[size];

  const iconSizes = {
    sm: 12,
    md: 15,
    lg: 18,
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-2xs transition-colors ${bgClass} ${sizeClasses}`}
    >
      <Icon size={iconSizes} className={status === 'Printing' ? 'animate-pulse' : ''} />
      <span>{label}</span>
    </span>
  );
}
