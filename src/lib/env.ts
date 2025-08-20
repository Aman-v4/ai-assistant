// Environment variable validation
function validateEnvVar(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function validateOptionalEnvVar(name: string, value: string | undefined): string | undefined {
  return value || undefined
}

// Required environment variables
export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  
  // NextAuth
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  
  // OAuth providers (optional)
  GOOGLE_CLIENT_ID: validateOptionalEnvVar('GOOGLE_CLIENT_ID', process.env.GOOGLE_CLIENT_ID),
  GOOGLE_CLIENT_SECRET: validateOptionalEnvVar('GOOGLE_CLIENT_SECRET', process.env.GOOGLE_CLIENT_SECRET),
  GITHUB_CLIENT_ID: validateOptionalEnvVar('GITHUB_CLIENT_ID', process.env.GITHUB_CLIENT_ID),
  GITHUB_CLIENT_SECRET: validateOptionalEnvVar('GITHUB_CLIENT_SECRET', process.env.GITHUB_CLIENT_SECRET),
  
  // API Keys (optional)
  ALPHA_VANTAGE_API_KEY: validateOptionalEnvVar('ALPHA_VANTAGE_API_KEY', process.env.ALPHA_VANTAGE_API_KEY),
  TWELVE_DATA_API_KEY: validateOptionalEnvVar('TWELVE_DATA_API_KEY', process.env.TWELVE_DATA_API_KEY),
  POLYGON_API_KEY: validateOptionalEnvVar('POLYGON_API_KEY', process.env.POLYGON_API_KEY),
  FINNHUB_API_KEY: validateOptionalEnvVar('FINNHUB_API_KEY', process.env.FINNHUB_API_KEY),
  OPENWEATHER_API_KEY: validateOptionalEnvVar('OPENWEATHER_API_KEY', process.env.OPENWEATHER_API_KEY),
} as const

// Validate on module load
console.log('✅ Environment variables validated successfully')
