module.exports = {
  appName: 'SimTrack',
  port: process.env.PORT || 3000,

  db: {
    mongodb: {
      host: process.env.MONGO_PORT_27017_TCP_ADDR || 'localhost',
      name: 'SimTrack' + (process.env.NODE_ENV == 'production' ? '' : '-develop'),
    }
  },

  oauth: {
    accessTokenLifetime: 60 * 60 * 24,
    refreshTokenLifetime: 60 * 60 * 24 * 7,
  },

  ldap: {
    host: 'auth.simbirsoft',
    port: 389,
    domain: 'simbirsoft',
    //username: 'serviceman',
    //password: 'FdKg&$b*)FeA{',
    dn: 'cn=People,dc=simbirsoft',
    username: 'admin',
    password: 'admin',
  },

  ps: {
    host: 'portaltest.simbirsoft',
    port: 8080,
    path: '/default/rest/',
    username: 'serviceman',
    password: 'FdKg&$b*)FeA{',
  },
};
