const { EntitySchema } = require("typeorm");

const UserSchema = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    name: {
      type: "varchar",
    },
    email: {
      type: "varchar",
      unique: true,
    },
    passwordHash: {
      type: "varchar",
    },
    resetPasswordTokenHash: {
      type: "varchar",
      nullable: true,
    },
    resetPasswordExpiresAt: {
      type: "timestamptz",
      nullable: true,
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
      inverseSide: "user",
    },
    likes: {
      type: "one-to-many",
      target: "Like",
      inverseSide: "user",
    },
    watchHistory: {
      type: "one-to-many",
      target: "WatchHistory",
      inverseSide: "user",
    },
  },
});

module.exports = { UserSchema };
