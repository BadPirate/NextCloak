import { entities } from "@auth/typeorm-adapter";
import { DataSource } from "typeorm";

const envOrmConnection = process.env.AUTH_TYPEORM_CONNECTION;
if (!envOrmConnection) {
  throw new Error("AUTH_TYPEORM_CONNECTION environment variable is not defined");
}

export const authTypeORMConnection = envOrmConnection

// Initialize TypeORM DataSource

import { CredentialsEntity } from "./entities/CredentialsEntity" // Import the new entity

export const ExtendedEntities = [
  CredentialsEntity,  // ✅ Include custom credentials entity
  ...Object.values(entities), // ✅ Exclude default UserEntity
]

console.log("ExtendedEntities", ExtendedEntities.map(e => e.name))

const AppDataSource = new DataSource({
  type: "postgres", // Change if using MySQL, SQLite, etc.
  url: authTypeORMConnection,
  synchronize: true, // Set to false in production (use migrations instead)
  logging: true,
  entities: ExtendedEntities, // Auto-load entities from adapter
});

export const getAppDataSource = async (): Promise<DataSource> => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
}

export default AppDataSource