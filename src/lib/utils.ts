import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function safeString(value: any, fallback = ""): string {
  return typeof value === 'string' ? value : fallback;
}
