import knex from "knex";
import { attachPaginate } from "knex-paginate";
import { config } from "dotenv";

config();
//  "7MzZPBeBeUZ3AqGJ5CJMYw"
//  "curl --create-dirs -o $HOME/.postgresql/root.crt -O https://cockroachlabs.cloud/clusters/9464b2e1-ed85-472f-8c97-e5c001af246a/cert"
// "postgresql://quadzs-labs:7MzZPBeBeUZ3AqGJ5CJMYw@free-tier12.aws-ap-south-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&options=--cluster=quark-check-511"

export const knexInstance = knex({
  client: "pg",
  connection: process.env.PG_CONNECTION_STRING,
  searchPath: ["knex", "public"],
  pool: {
    min: 0,
    max: 10,
  },
});

attachPaginate();
