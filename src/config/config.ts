import { ConfigProps } from './interfaces/config.interface';

export const configProps = (): ConfigProps => ({
  db: {
    databaseName: process.env.DB_NAME || 'local',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.DB_SSL?.toLowerCase?.() === 'true' || false,
    username: process.env.DB_USERNAME || 'username',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
  },
});
