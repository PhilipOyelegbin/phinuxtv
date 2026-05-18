require("dotenv").config();
require("reflect-metadata");

const { DataSource } = require("typeorm");
const { UserSchema } = require("./entities/User");
const { MovieSchema } = require("./entities/Movie");
const { FavoriteSchema } = require("./entities/Favorite");
const { LikeSchema } = require("./entities/Like");
const { WatchHistorySchema } = require("./entities/WatchHistory");

const dataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: process.env.TYPEORM_SYNC !== "false",
  logging: false,
  entities: [
    UserSchema,
    MovieSchema,
    FavoriteSchema,
    LikeSchema,
    WatchHistorySchema,
  ],
});

module.exports = { dataSource };
