import request from "supertest";
import httpStatus from 'http-status';

import * as MySQLConnector from '../../../src/api/utils/queryMySqlDB';
import app from "../../../src/app";

describe("Test smartContract.controller.ts", () => {

    beforeEach(async () => {
        if (! await MySQLConnector.connectionIsAlive()) MySQLConnector.init();
    });

    afterAll(() => {
        MySQLConnector.close();
    });

    describe("Test retrieve Goerli Smart Contract Address endpoint", () => {

        test("Should retrieve Goerli Smart Contract Address successfully", async () => {
            const merchantId = "60cc298075dbc60009b79dez";
            const res = await request(app).get(`/v1/merchant/goerli/${merchantId}`);

            expect(res.statusCode).toEqual(httpStatus.OK);
            expect(res.body).toHaveProperty('merchantId');
            expect(res.body).toHaveProperty('contractAddress');
        });

        test("Should fail to retrieve Goerli Smart Contract Address with non-existing merchant ID", async () => {
            const merchantId = "60cc298075dbc60009b79dezy";
            const res = await request(app).get(`/v1/merchant/goerli/${merchantId}`);

            expect(res.statusCode).toEqual(httpStatus.NOT_FOUND);
            expect(res.body).toHaveProperty('message');
        });

        test("Should fail to retrieve Goerli Smart Contract Address when database connection is down", async () => {
            const merchantId = "60cc298075dbc60009b79dez";
            // Emulate database server is down
            MySQLConnector.close();

            const res = await request(app).get(`/v1/merchant/goerli/${merchantId}`);

            expect(res.statusCode).toEqual(httpStatus.INTERNAL_SERVER_ERROR);
            expect(res.body).toHaveProperty('message');
        });

    });

    describe("Test insert Goerli Smart Contract Address info endpoint", () => {

        test ("Should insert Goerli Smart Contract Address info successfully", async () => {
            const merchantId = "unitTest";
            const contractAddress="dummyAddress0xFF";

            const res = await request(app).post(`/v1/merchant/goerli`)
                            .send({
                                merchantId,
                                contractAddress
                            });

            expect(res.statusCode).toEqual(httpStatus.OK);
            expect(res.body).toHaveProperty('status');
            expect(res.body).toHaveProperty('message');
            expect(res.body.status).toEqual(true);

        });

        test("Should fail to insert Goerli Smart Contract Address info as merchant ID field does not exist", async () => {
            const contractAddress = "dummyAddress0xFF";

            const res = await request(app).post(`/v1/merchant/goerli`)
                .send({
                    contractAddress
                });

            expect(res.statusCode).toEqual(httpStatus.BAD_REQUEST);
            expect(res.body).toHaveProperty('errors');
        });

        test("Should fail to insert Goerli Smart Contract Address info as merchant ID field is not string type", async () => {
            const merchantIdInt = 345;
            const merchantIdBoolean = false;
            const contractAddress = "dummyAddress0xFF";

            const resInt = await request(app).post(`/v1/merchant/goerli`)
                .send({
                    merchantId: merchantIdInt,
                    contractAddress
                });

            expect(resInt.statusCode).toEqual(httpStatus.BAD_REQUEST);
            expect(resInt.body).toHaveProperty('errors');

            const resBoolean = await request(app).post(`/v1/merchant/goerli`)
                .send({
                    merchantId : merchantIdBoolean,
                    contractAddress
                });

            expect(resBoolean.statusCode).toEqual(httpStatus.BAD_REQUEST);
            expect(resBoolean.body).toHaveProperty('errors');
        });

        test("Should fail to insert Goerli Smart Contract Address info as contract address field does not exist", async () => {
            const merchantId = "unitTest";

            const res = await request(app).post(`/v1/merchant/goerli`)
                .send({
                    merchantId
                });

            expect(res.statusCode).toEqual(httpStatus.BAD_REQUEST);
            expect(res.body).toHaveProperty('errors');
        });

        test("Should fail to insert Goerli Smart Contract Address info as contract address field is not string type", async () => {
            const contractAddressInt = 789;
            const contractAddressBoolean = true;
            const merchantId = "unitTest";

            const resInt = await request(app).post(`/v1/merchant/goerli`)
                .send({
                    merchantId,
                    contractAddress: contractAddressInt
                });

            expect(resInt.statusCode).toEqual(httpStatus.BAD_REQUEST);
            expect(resInt.body).toHaveProperty('errors');

            const resBoolean = await request(app).post(`/v1/merchant/goerli`)
                .send({
                    merchantId,
                    contractAddress : contractAddressBoolean
                });

            expect(resBoolean.statusCode).toEqual(httpStatus.BAD_REQUEST);
            expect(resBoolean.body).toHaveProperty('errors');
        });

        test("Should fail to insert Goerli Smart Contract Address when database connection is down", async () => {
            const merchantId = "unitTest";
            const contractAddress="dummyAddress0xFF";
            // Emulate database server is down
            MySQLConnector.close();

            const res = await request(app).post(`/v1/merchant/goerli`)
                .send({
                    merchantId,
                    contractAddress
                });

            expect(res.statusCode).toEqual(httpStatus.INTERNAL_SERVER_ERROR);
            expect(res.body).toHaveProperty('message');
        });

    });

    describe("Test retrieve Geth Smart Contract Address endpoint", () => {

        test("Should retrieve Geth Smart Contract Address successfully", async () => {
            const merchantId = "60cc298075dbc60009b79dez";
            const res = await request(app).get(`/v1/merchant/geth/${merchantId}`);

            expect(res.statusCode).toEqual(httpStatus.OK);
            expect(res.body).toHaveProperty('merchantId');
            expect(res.body).toHaveProperty('contractAddress');
        });

        test("Should fail to retrieve Geth Smart Contract Address with non-existing merchant ID", async () => {
            const merchantId = "60cc298075dbc60009b79dezy";
            const res = await request(app).get(`/v1/merchant/geth/${merchantId}`);

            expect(res.statusCode).toEqual(httpStatus.NOT_FOUND);
            expect(res.body).toHaveProperty('message');
        });

        test("Should fail to retrieve Geth Smart Contract Address when database connection is down", async () => {
            const merchantId = "60cc298075dbc60009b79dez";
            // Emulate database server is down
            MySQLConnector.close();

            const res = await request(app).get(`/v1/merchant/geth/${merchantId}`);

            expect(res.statusCode).toEqual(httpStatus.INTERNAL_SERVER_ERROR);
            expect(res.body).toHaveProperty('message');
        });

    });

    describe("Test insert Geth Smart Contract Address info endpoint", () => {

        test ("Should insert Geth Smart Contract Address info successfully", async () => {
            const merchantId = "unitTest";
            const contractAddress="dummyAddress0xFF";

            const res = await request(app).post(`/v1/merchant/geth`)
                            .send({
                                merchantId,
                                contractAddress
                            });

            expect(res.statusCode).toEqual(httpStatus.OK);
            expect(res.body).toHaveProperty('status');
            expect(res.body).toHaveProperty('message');
            expect(res.body.status).toEqual(true);

        });

        test("Should fail to insert Geth Smart Contract Address info as merchant ID field does not exist", async () => {
            const contractAddress = "dummyAddress0xFF";

            const res = await request(app).post(`/v1/merchant/geth`)
                .send({
                    contractAddress
                });

            expect(res.statusCode).toEqual(httpStatus.BAD_REQUEST);
            expect(res.body).toHaveProperty('errors');
        });

        test("Should fail to insert Geth Smart Contract Address info as merchant ID field is not string type", async () => {
            const merchantIdInt = 123;
            const merchantIdBoolean = true;
            const contractAddress = "dummyAddress0xFF";

            const resInt = await request(app).post(`/v1/merchant/geth`)
                .send({
                    merchantIdInt,
                    contractAddress
                });

            expect(resInt.statusCode).toEqual(httpStatus.BAD_REQUEST);
            expect(resInt.body).toHaveProperty('errors');

            const resBoolean = await request(app).post(`/v1/merchant/geth`)
                .send({
                    merchantIdBoolean,
                    contractAddress
                });

            expect(resBoolean.statusCode).toEqual(httpStatus.BAD_REQUEST);
            expect(resBoolean.body).toHaveProperty('errors');
        });

        test("Should fail to insert Geth Smart Contract Address info as contract address field does not exist", async () => {
            const merchantId = "unitTest";

            const res = await request(app).post(`/v1/merchant/geth`)
                .send({
                    merchantId
                });

            expect(res.statusCode).toEqual(httpStatus.BAD_REQUEST);
            expect(res.body).toHaveProperty('errors');
        });

        test("Should fail to insert Geth Smart Contract Address info as contract address field is not string type", async () => {
            const contractAddressInt = 654;
            const contractAddressBoolean = false;
            const merchantId = "unitTest";

            const resInt = await request(app).post(`/v1/merchant/geth`)
                .send({
                    merchantId,
                    contractAddressInt
                });

            expect(resInt.statusCode).toEqual(httpStatus.BAD_REQUEST);
            expect(resInt.body).toHaveProperty('errors');

            const resBoolean = await request(app).post(`/v1/merchant/geth`)
                .send({
                    merchantId,
                    contractAddressBoolean
                });

            expect(resBoolean.statusCode).toEqual(httpStatus.BAD_REQUEST);
            expect(resBoolean.body).toHaveProperty('errors');
        });

        test("Should fail to insert Geth Smart Contract Address when database connection is down", async () => {
            const merchantId = "unitTest";
            const contractAddress="dummyAddress0xFF";
            // Emulate database server is down
            MySQLConnector.close();

            const res = await request(app).post(`/v1/merchant/geth`)
                .send({
                    merchantId,
                    contractAddress
                });

            expect(res.statusCode).toEqual(httpStatus.INTERNAL_SERVER_ERROR);
            expect(res.body).toHaveProperty('message');
        });

    });

});

