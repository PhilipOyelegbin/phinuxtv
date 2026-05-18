const { EntitySchema } = require("typeorm");

const WatchHistorySchema = new EntitySchema({
  name: "WatchHistory",
  tableName: "watch_history",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    progressSeconds: {
      type: "int",
      default: 0,
    },
    completed: {
      type: "boolean",
      default: false,
    },
    watchedAt: {
      type: "timestamptz",
      createDate: true,
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: true,
      onDelete: "CASCADE",
      eager: true,
    },
    movie: {
      type: "many-to-one",
      target: "Movie",
      joinColumn: true,
      onDelete: "CASCADE",
      eager: true,
    },
  },
});

module.exports = { WatchHistorySchema };
