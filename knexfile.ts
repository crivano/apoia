import dotenv from 'dotenv'
import fs from 'node:fs'
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' })
} else {
  dotenv.config({ path: '.env' })
}

const knexConfig = {
  client: process.env.DB_CLIENT,
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3305,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false,
  },
  pool: { min: 0, max: process.env.DB_POOL ? parseInt(process.env.DB_POOL) : 2 },
}

export default knexConfig