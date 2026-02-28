const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  API_URL: getEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3000/api/v1'),
  APP_NAME: getEnv('NEXT_PUBLIC_APP_NAME', 'SaaS App'),
  APP_URL: getEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3001'),
  STRIPE_PUBLISHABLE_KEY: getEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', ''),
} as const;

export type Env = typeof env;
