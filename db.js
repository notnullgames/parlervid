const { Client } = require('pg')

const { DATABASE_URL } = process.env

if (!DATABASE_URL) {
  throw new Error('You need to set DATABASE_URL to your postgres database.')
}

module.exports = new Client({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})
