// db.js
import knex from 'knex';
import config from './knexfile.js';  // Extensión .js obligatoria en ESM

const db = knex(config.development);

export default db;