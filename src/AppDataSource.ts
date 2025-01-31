import { entities } from "@auth/typeorm-adapter";
import { DataSource } from "typeorm";

const envOrmConnection = process.env.AUTH_TYPEORM_CONNECTION;
if (!envOrmConnection) {
  throw new Error("AUTH_TYPEORM_CONNECTION environment variable is not defined");
}

export const authTypeORMConnection = envOrmConnection

// Initialize TypeORM DataSource

const AppDataSource = new DataSource({
  type: "postgres", // Change if using MySQL, SQLite, etc.
  url: authTypeORMConnection,
  synchronize: true, // Set to false in production (use migrations instead)
  logging: true,
  entities: Object.values(entities), // Auto-load entities from adapter
});

export default AppDataSource