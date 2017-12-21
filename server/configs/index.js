module.exports = {
  appName: 'SimTrack',
  port: process.env.PORT || 8080,
  db: {
    postgres: {
      host: process.env.DATABASE_HOST || 'localhost',
      port: process.env.DATABASE_PORT || 5432,
      dialect: 'postgres',
      name: process.env.DATABASE_NAME || 'sim-track',
      username: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || '123456'
    }
  },
  ps: {
    host: 'portaltest.simbirsoft',
    port: 8080,
    path: '/default/rest/',
    username: 'serviceman',
    password: 'FdKg&$b*)FeA{'
  },
  auth: {
    accessTokenLifetime: 60 * 60 * 24 * 7
  },
  systemAuth: {
    login: 'systemUser',
    password: 'N}q6gF7L',
    accessTokenLifetime: 60 * 60 * 24 * 365 * 10
  },
  ldapUrl: process.env.LDAP_URL || 'ldap://auth-copy.simbirsoft:389/dc=simbirsoft'
};
