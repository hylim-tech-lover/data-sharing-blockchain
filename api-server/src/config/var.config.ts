import {resolve} from 'path';
import {config} from 'dotenv';

config({path: resolve(__dirname, "../.env")});

export const dataSources = {
    connectionLimit: 4,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dateStrings: true
};


