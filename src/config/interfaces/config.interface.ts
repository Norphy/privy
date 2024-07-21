interface DBConfigProps {
  username: string;
  port: number;
  host: string;
  password: string;
  ssl: boolean;
  databaseName: string;
}

export interface ConfigProps {
  db: DBConfigProps;
}
