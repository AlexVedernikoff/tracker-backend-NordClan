const path = require('path');

module.exports = {
  appName: 'Epic',
  port: process.env.PORT || 8080,
  httpsPort: process.env.HTTPS_PORT || 4433,
  certificateCrt: process.env.CERTIFICATE_CRT || path.join(__dirname, '../', '/serverstore/nordclanCA.crt'),
  certificateKey: process.env.CERTIFICATE_KEY || path.join(__dirname, '../', '/serverstore/nordclanCA.key'),
  certificatePassphrase: process.env.CERTIFICATE_PASSPHRASE || process.env.HTTPS_PASSPHRASE,
  featureFlags: {
    root: {
      project: {
        userCreate: {
          processGitlabRoles: true,
        },
      },
    },
  },
  db:
  {
    postgres: {
      host: process.env.DATABASE_HOST || 'localhost',
      port: process.env.DATABASE_PORT || 5432,
      dialect: 'postgres',
      name: process.env.DATABASE_NAME || 'track',
      username: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || '123456',
    },
  },
  gitLab: {
    host: process.env.GITLAB_HOST,
    token: process.env.GITLAB_TOKEN,
  },
  auth: {
    accessTokenLifetime: 60 * 60 * 24 * 7,
  },
  systemAuth: {
    login: 'systemUser',
    password: process.env.SYSTEMUSER_PASSWORD || '5REhSX',
    accessTokenLifetime: 60 * 60 * 24 * 365 * 10,
  },
  keycloak: {
    realm: process.env.KEYCLOAK_REALM || 'nordclan-dev',
    'bearer-only': true,
    'auth-server-url': process.env.KEYCLOAK_URL,
    'ssl-required': 'external',
    resource: 'local-simtrack-bearer-only',
    'confidential-port': 0,
  },
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true' || process.env.email_enabled === 'true',
    service: process.env.EMAIL_SERVICE,
    login: process.env.EMAIL_LOGIN,
    password: process.env.EMAIL_PASSWORD,
    title: process.env.EMAIL_TITLE,
    templateBaseUrl: process.env.EMAIL_TEMPLATE_BASE_URL,
    templateExternalUrl: process.env.EXTERNAL_URL,
  },
  emailsToSendErrorsByMetrics: [
    'tatyana.babich@nordclan.com',
    'andrei.frenkel@nordclan.com',
  ],
  emailForDevOpsNotify: 'andrei.frenkel@nordclan.com',
  ldapUrl: process.env.LDAP_URL,
  ttiUrl: process.env.TTI_HOST,
  metricManagerPort: process.env.METRIC_MANAGER_PORT || 8881,
  imagesSalt: process.env.IMAGES_SALT || 'someSaltForImagesHere',
};
