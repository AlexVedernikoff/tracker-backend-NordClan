module.exports = {
  development: {
    username: process.env.DATABASE_USERNAME || 'shiny',
    password: process.env.DATABASE_PASSWORD || '123',
    database: process.env.DATABASE_NAME || 'simtrack',
    host: process.env.DATABASE_HOST || 'localhost',
    dialect: 'postgres'
  },
  test: {
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || '123456',
    database: process.env.DATABASE_NAME || 'sim-track',
    host: process.env.DATABASE_HOST || 'localhost',
    dialect: 'postgres'
  },
  production: {
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || '123456',
    database: process.env.DATABASE_NAME || 'sim-track',
    host: process.env.DATABASE_HOST || 'localhost',
    dialect: 'postgres'
  }
};
