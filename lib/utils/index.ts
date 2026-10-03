import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | null | undefined, fmt = 'dd MMM yyyy'): string {
  if (!date) return '—'
  try {
    return format(parseISO(date), fmt)
  } catch {
    return date
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDiscount(type: 'percentage' | 'fixed', value: number): string {
  if (type === 'percentage') return `${value}% off`
  return `₹${value} off`
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function isOfferValid(startDate: string | null, endDate: string | null): boolean {
  const now = new Date()
  if (startDate && new Date(startDate) > now) return false
  if (endDate && new Date(endDate) < now) return false
  return true
}
