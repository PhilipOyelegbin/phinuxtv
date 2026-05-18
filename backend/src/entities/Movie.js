const { EntitySchema } = require("typeorm");

const MovieSchema = new EntitySchema({
  name: "Movie",
  tableName: "movies",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    tmdbId: {
      type: "int",
      unique: true,
      nullable: true,
    },
    title: {
      type: "varchar",
    },
    description: {
      type: "text",
    },
    genre: {
      type: "varchar",
    },
    tags: {
      type: "simple-array",
      default: "",
    },
    cast: {
      type: "simple-array",
      default: "",
    },
    director: {
      type: "varchar",
    },
    releaseYear: {
      type: "int",
    },
    durationMinutes: {
      type: "int",
    },
    rating: {
      type: "numeric",
      precision: 3,
      scale: 1,
      default: 0,
    },
    posterUrl: {
      type: "varchar",
    },
    streamUrl: {
      type: "varchar",
    },
    createdAt: {
      type: "timestamptz",
      createDate: true,
    },
    updatedAt: {
      type: "timestamptz",
      updateDate: true,
    },
  },
  relations: {
    favorites: {
      type: "one-to-many",
      target: "Favorite",
      inverseSide: "movie",
    },
    likes: {
      type: "one-to-many",
      target: "Like",
      inverseSide: "movie",
    },
    watchHistory: {
      type: "one-to-many",
      target: "WatchHistory",
      inverseSide: "movie",
    },
  },
});

module.exports = { MovieSchema };
