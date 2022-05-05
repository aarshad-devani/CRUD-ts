import knex from "knex";

export const knexInstance = knex({
  client: "pg",
  connection: process.env.PG_CONNECTION_STRING,
  searchPath: ["knex", "public"],
  pool: {
    min: 0,
    max: 10,
  },
});
