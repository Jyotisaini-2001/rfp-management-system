import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-700 border border-slate-200',
    SENT: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
    EVALUATING: 'bg-amber-100 text-amber-700 border border-amber-200',
    AWARDED: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    CLOSED: 'bg-red-100 text-red-700 border border-red-200',
    RECEIVED: 'bg-slate-100 text-slate-700 border border-slate-200',
    PARSED: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
    EVALUATED: 'bg-purple-100 text-purple-700 border border-purple-200',
    SELECTED: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    REJECTED: 'bg-red-100 text-red-700 border border-red-200',
  };
  return colors[status] || 'bg-slate-100 text-slate-700 border border-slate-200';
}
