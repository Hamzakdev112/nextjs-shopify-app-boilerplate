export function env(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function optionalEnv(name: string, fallback?: string): string | undefined {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") return undefined;
  return value;
}
