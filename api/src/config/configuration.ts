/**
 * Single source of truth for backend configuration.
 *
 * Every environment variable is read here and given a sensible development
 * default. Nothing elsewhere in the app should read `process.env` directly or
 * hard-code a fallback — they call `ConfigService.get('...')` and trust the
 * defaults defined below. `.env` overrides these for real deployments.
 */
export const configuration = () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  mongoUri:
    process.env.MONGODB_URI ??
    'mongodb://localhost:27017/lexamica?directConnection=true',
  webOrigin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',

  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-only-change-me-to-a-long-random-string',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },

  cookie: {
    name: process.env.COOKIE_NAME ?? 'lexamica_session',
    maxAgeMs: 1000 * 60 * 60 * 24 * 7, // 7 days
  },

  referral: {
    // How long a fresh invitation stays live before it can be expired.
    invitationTtlMs: parseInt(
      process.env.INVITATION_TTL_MS ?? String(1000 * 60 * 60 * 24),
      10,
    ), // 24h
  },
});

export type AppConfiguration = ReturnType<typeof configuration>;
