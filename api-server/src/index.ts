import app from "./app";
import Logger from "./config/logger";
import * as MySQLConnector from './api/utils/queryMySqlDB';

const port = 3000;

// create database pool
MySQLConnector.init();

app.listen(port, () => {

  Logger.info(`Example app listening at http://localhost:${port}`);
});