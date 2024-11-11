import Knex from 'knex';
import knexConfig from '../../knexfile';

const db = Knex(knexConfig);

export default db;