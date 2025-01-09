import Knex from 'knex'
import knexConfig from '../../knexfile'
import { envString } from '../utils/env'

const db = envString('DB_CLIENT') ? Knex(knexConfig) : undefined

export default db