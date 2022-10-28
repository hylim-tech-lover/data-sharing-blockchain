import cors from 'cors';
import httpStatus from 'http-status';

import express, { json, urlencoded } from 'express';

import routeV1 from './api/routes/v1';
import morganMiddleware from './config/morgan';

const app = express();

app.use(json());

// Replace default logging for middleware
app.use(morganMiddleware);

app.use(
  urlencoded({
    extended: true,
  })
);

// enable all CORS request
app.use(cors());

app.use("/v1",routeV1);

// send back a 404 error for any unknown api request
app.use((req, res) => {
  res.status(httpStatus.NOT_FOUND).json({message: `url path : ${req.path} does not exist`});
});

export default app;