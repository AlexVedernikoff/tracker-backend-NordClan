module.exports = {
    appName: 'SimTrack',
    port: process.env.PORT || 3000,

    db: {
        postgres: {
            host: 'localhost',
            port: 5432,
            dialect: 'postgres',
            name: 'sim-track',
            username: 'postgres',
            password: '123'
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
