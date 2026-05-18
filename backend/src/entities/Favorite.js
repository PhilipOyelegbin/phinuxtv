const { EntitySchema } = require("typeorm");

const FavoriteSchema = new EntitySchema({
  name: "Favorite",
  tableName: "favorites",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    createdAt: {
      type: "timestamptz",
      createDate: true,
    },
  },
  uniques: [
    {
      name: "UQ_favorite_user_movie",
      columns: ["user", "movie"],
    },
  ],
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

module.exports = { FavoriteSchema };
