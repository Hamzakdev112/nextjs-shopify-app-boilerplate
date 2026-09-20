export function hostnameFromUrl(value: string): string {
  return new URL(value).hostname;
}
