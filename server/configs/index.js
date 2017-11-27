module.exports = {
  appName: 'SimTrack',
  port: process.env.PORT || 8080,
  db: {
    postgres: {
      host: process.env.DATABASE_HOST || 'localhost',
      port: 5432,
      dialect: 'postgres',
      name: 'sim-track',
      username: 'postgres',
      password: '123456'
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
  email: {
    enabled: false,
    service: 'serviceHere',
    login: 'mail@here.ru',
    password: 'passwordHere',
    title: 'SimTrack',
    templateBaseUrl: 'http://sim-track.simbirsoft'
  }
};
