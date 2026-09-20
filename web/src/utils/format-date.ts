export function formatDate(value: Date | string): string {
  return new Date(value).toLocaleDateString();
}

export function formatDateTime(value: Date | string | number): string {
  return new Date(value).toLocaleString();
}
