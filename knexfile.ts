import dotenv from 'dotenv'
import fs from 'node:fs'
if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config({ path: '.env' });
}

const knexConfig = {
  client: "mysql2",
  connection: {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3305,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },
  pool: { min: 0, max: process.env.MYSQL_POOL ? parseInt(process.env.MYSQL_POOL) : 2 },
};



export default knexConfig