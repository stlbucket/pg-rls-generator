import { ConnectionConfig } from "pg";

const defaultDbConfig: ConnectionConfig = {
  connectionString: "postgres://postgres:1234@0.0.0.0/soro_sales"
}

export default defaultDbConfig