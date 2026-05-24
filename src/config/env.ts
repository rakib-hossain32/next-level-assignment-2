import dotenv from "dotenv";
import path from "path";
import process from "process";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const config = {
  port: process.env.PORT as string,
  database_url: process.env.DATABASE_URL as string,
  refresh_secret: process.env.REFRESH_SECRET as string,
  secret: process.env.SECRET as string,
};

export default config;
