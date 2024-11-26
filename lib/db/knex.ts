import Knex from 'knex'
import knexConfig from '../../knexfile'

const db = process.env.DB_CLIENT ? Knex(knexConfig) : undefined

export default db