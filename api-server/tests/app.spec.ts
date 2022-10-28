import request from "supertest";
import httpStatus from 'http-status';

import app from "../src/app";

describe("Test app.ts", () => {
    test("Catch invalid endpoints", async () => {
        const res1 = await request(app).get("/");

        expect(res1.statusCode).toEqual(httpStatus.NOT_FOUND);
        expect(res1.body.message).toEqual("url path : / does not exist");
        
        const res2 = await request(app).get("/notExist");

        expect(res2.statusCode).toEqual(httpStatus.NOT_FOUND);
        expect(res2.body.message).toEqual("url path : /notExist does not exist");

        const res3 = await request(app).get("/helloWorld");

        expect(res3.statusCode).toEqual(httpStatus.NOT_FOUND);
        expect(res3.body.message).toEqual("url path : /helloWorld does not exist"); 
    });
});