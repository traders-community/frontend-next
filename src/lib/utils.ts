import { clsx, type ClassValue } from "clsx";

/**
 * Combines multiple class values into a single class string using clsx.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Formats an ISO date string or timestamp into a readable date format.
 * Defaults to "en-IN" with "dd Mon yyyy" style.
 */
export function formatDate(dateInput?: string | number | Date): string {
  if (!dateInput) return "";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return "";
  }
}

/**
 * Extracts a plain text excerpt from HTML/Markdown string without HTML tags.
 */
export function getPlainExcerpt(html: string = "", maxLength: number = 150): string {
  if (!html) return "";
  const plainText = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

  if (plainText.length <= maxLength) return plainText;
  return plainText.slice(0, maxLength).trim() + "...";
}

/**
 * Calculates estimated reading time in minutes from HTML or text content.
 */
export function calculateReadingTime(content: string = ""): number {
  if (!content) return 1;
  const words = content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length;
  const wordsPerMinute = 200;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

/**
 * Generic debounce utility function for delaying execution of a function
 * until after a certain wait time has elapsed since the last time it was invoked.
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number = 400
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}
