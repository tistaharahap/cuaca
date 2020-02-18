export default {
  appPort: process.env.PORT || 3000,
  appHost: process.env.HOST || '0.0.0.0',
  mongoDbConnString: process.env.MONGO_DB_CONN_STRING || ''
}
