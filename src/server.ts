import app from "./app";
import config from "./config/env";
import { initDB } from "./db/database";

const main = () => {
  initDB();
  app.listen(config.port, () => {
    console.log(`assignment server is running port - ${config.port}`);
  });
};

main();
