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
  gitLab: {
    host: process.env.GITLAB_HOST || 'gitlab-test.simbirsoft',
    token: process.env.GITLAB_TOKEN || 'DBx1nxkqSEEpwhbAT4K5'
  },
  auth: {
    accessTokenLifetime: 60 * 60 * 24 * 7
  },
  systemAuth: {
    login: 'systemUser',
    password: process.env.SYSTEMUSER_PASSWORD || '5REhSX',
    accessTokenLifetime: 60 * 60 * 24 * 365 * 10
  },
  keycloak: {
    realm: process.env.KEYCLOAK_REALM || 'simbirsoft-dev',
    'bearer-only': true,
    'auth-server-url': process.env.KEYCLOAK_URL || 'http://sso.simbirsoft:8080/auth',
    'ssl-required': 'external',
    resource: 'local-simtrack-bearer-only',
    'confidential-port': 0
  },
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    service: 'Yandex',
    login: 'sim-track@simbirsoft.com',
    password: 'AP2y2CHU',
    title: 'SimTrack',
    templateBaseUrl: 'http://sim-track.simbirsoft1.com'
  },
  emailsToSendErrorsByMetrics: [
    'tatyana.babich@simbirsoft.com',
    'victor.sychev@simbirsoft.com',
    'anastasiya.karaseva@simbirsoft.com',
    'maxim.baranov@simbirsoft.com'
  ],
  emailForDevOpsNotify: 'devops-support@simbirsoft.com',
  ldapUrl:
    process.env.LDAP_URL || 'ldap://auth-copy.simbirsoft:389/dc=simbirsoft',
  ttiUrl: process.env.TTI_HOST || 'http://simtrack-tti-dev.docker.simbirsoft',
  metricManagerPort: process.env.METRIC_MANAGER_PORT || 8881
};
