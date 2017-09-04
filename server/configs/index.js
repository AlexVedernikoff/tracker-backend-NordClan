module.exports = {
  appName: 'SimTrack',
  port: process.env.PORT || 8080,
  db: {
    postgres: {
      host: 'sim-track.simbirsoft',
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
    password: 'FdKg&$b*)FeA{',
  },
  auth: {
    accessTokenLifetime: 60 * 60 * 24 * 7,
  },
};