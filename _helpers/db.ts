import config from '../config.json';
import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token';

const db: any = {};
export default db;

initialize();

async function initialize() {
  // 1. Fallback logic: Use Environment Variables if they exist, otherwise use config.json
  const host = process.env.DB_HOST || config.database.host;
  const port = Number(process.env.DB_PORT) || config.database.port || 3306;
  const user = process.env.DB_USER || config.database.user;
  const password = process.env.DB_PASSWORD || config.database.password;
  const database = process.env.DB_NAME || config.database.database;

  // 2. Connect to the MySQL Server
  const connection = await mysql.createConnection({ host, port, user, password });

  // Create DB if it doesn't exist (Hostinger usually requires the DB to exist already, but this keeps it safe)
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

  // 3. Connect via Sequelize ORM
  const sequelize = new Sequelize(database, user, password, { 
    host: host,
    port: port,
    dialect: 'mysql',
    logging: false // Prevents console clutter during startup
  });

  // Init models
  db.Account = accountModel(sequelize);
  db.RefreshToken = refreshTokenModel(sequelize);

  // Define relationships
  db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
  db.RefreshToken.belongsTo(db.Account);

  // Sync models with database
  await sequelize.sync();
}