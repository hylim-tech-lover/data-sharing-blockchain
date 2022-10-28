import request from "supertest";
import httpStatus from 'http-status';

import * as MySQLConnector from '../../../src/api/utils/queryMySqlDB';
import { symEncryptionController } from '../../../src/api/controllers';
import app from "../../../src/app";

const dummyJsonData = {
    "data": {
        "merchantId": "60cc298075dbc60009b79dez",
        "platformTxId": "62a70f4a316a320009bf514f",
        "created": 1654597194196,
        "amount": 259,
        "currency": "GBP",
        "state": "CONFIRMED",
        "note": "-"
    },
    "dataHash": "805f975d2b62e3a98e63e88a53d23010"
};

const stringifyJsonData = JSON.stringify(dummyJsonData).trim();

const existingMerchantId = "unitTest";
let encryptedData: String;

describe("Test symEncryption.controller.ts", () => {

    beforeEach(async () => {
        if (! await MySQLConnector.connectionIsAlive()) MySQLConnector.init();
    });

    afterAll(() => {
        MySQLConnector.close();
    });

    describe("Test data encryption endpoint", () => {

        test("Should encrypt data payload successfully with existing database entry", async () => {

            const isExistRes = await request(app).get(`/v1/symEncrypt/geth/checkIfExist/${existingMerchantId}`);
            expect(isExistRes.statusCode).toEqual(httpStatus.OK);
            expect(isExistRes.body).toHaveProperty('status');

            // If merchant ID is not exist in database
            if (!isExistRes.body.status) {
                // Run for the first time to create new encryption key with merchant ID.
                const insertNewEntryres = await request(app).post(`/v1/symEncrypt/geth/encryptData`)
                    .send({
                        merchantId: existingMerchantId,
                        data: stringifyJsonData
                    });

                expect(insertNewEntryres.statusCode).toEqual(httpStatus.OK);
            }

            const res = await request(app).post(`/v1/symEncrypt/geth/encryptData`)
                .send({
                    merchantId: existingMerchantId,
                    data: stringifyJsonData
                });

            expect(res.statusCode).toEqual(httpStatus.OK);
            expect(res.body).toHaveProperty('encryptData');
            encryptedData = res.body.encryptData;
        });

        test("Should encrypt data payload successfully with new merchant ID", async () => {

            // Make this unique so it will always be new merchant ID
            const merchantId = `unitTest_${Date.now()}`;

            const res = await request(app).post(`/v1/symEncrypt/geth/encryptData`)
                .send({
                    merchantId,
                    data: stringifyJsonData
                });

            expect(res.statusCode).toEqual(httpStatus.OK);
            expect(res.body).toHaveProperty('encryptData');
        });

        test("Should fail to encrypt data payload as merchant ID field does not exist", async () => {

            const res = await request(app).post(`/v1/symEncrypt/geth/encryptData`)
                .send({
                    data: stringifyJsonData
                });

            expect(res.statusCode).toEqual(httpStatus.BAD_REQUEST);
            expect(res.body).toHaveProperty('errors');
        });

        test("Should fail to encrypt data payload as merchant ID field is not string type", async () => {
            const merchantIdInt = 654;
            const merchantIdBoolean = false;

            const resInt = await request(app).post(`/v1/symEncrypt/geth/encryptData`)
                .send({
                    merchantId: merchantIdInt,
                    data: stringifyJsonData
                });

            expect(resInt.statusCode).toEqual(httpStatus.BAD_REQUEST);
            expect(resInt.body).toHaveProperty('errors');

            const resBoolean = await request(app).post(`/v1/symEncrypt/geth/encryptData`)
                .send({
                    merchantId: merchantIdBoolean,
                    data: stringifyJsonData
                });

            expect(resBoolean.statusCode).toEqual(httpStatus.BAD_REQUEST);
            expect(resBoolean.body).toHaveProperty('errors');
        });

        test("Should fail to encrypt data payload as data field does not exist", async () => {

            const merchantId = "unitTest";

            const res = await request(app).post(`/v1/symEncrypt/geth/encryptData`)
                .send({
                    merchantId
                });

            expect(res.statusCode).toEqual(httpStatus.BAD_REQUEST);
            expect(res.body).toHaveProperty('errors');
        });

        test("Should fail to encrypt data payload when database connection is down", async () => {
            const merchantId = "unitTest";

            // Emulate database server is down
            MySQLConnector.close();

            const res = await request(app).post(`/v1/symEncrypt/geth/encryptData`)
                .send({
                    merchantId,
                    data: stringifyJsonData
                });

            expect(res.statusCode).toEqual(httpStatus.INTERNAL_SERVER_ERROR);
            expect(res.body).toHaveProperty('message');
        });

    });

    describe("Test data decryption endpoint", () => {

        let encryptedKey: String;

        test("Should decrypt data payload successfully with existing database entry and valid encryption key", async () => {

            // Use existingMerchantId to check for existing endpoint
            const isExistRes = await request(app).get(`/v1/symEncrypt/geth/checkIfExist/${existingMerchantId}`);
            expect(isExistRes.statusCode).toEqual(httpStatus.OK);
            expect(isExistRes.body).toHaveProperty('status');
            expect(isExistRes.body.status).toEqual(true);

            const result = await symEncryptionController.checkDBForEncryptionKey(existingMerchantId);
            encryptedKey = result[0].encryptionKey;

            const res = await request(app).post(`/v1/symEncrypt/geth/decryptData`)
                .send({
                    encryptedData,
                    encryptedKey
                });

            expect(res.statusCode).toEqual(httpStatus.OK);
            expect(res.body).toHaveProperty('data');
            expect(res.body).toHaveProperty('status');
            expect(res.body.status).toEqual(true);
            expect(res.body.data).toEqual(stringifyJsonData);
        });

        test("Should fail to decrypt data payload as encrypted data field does not exist", async () => {

            const res = await request(app).post(`/v1/symEncrypt/geth/decryptData`)
                .send({
                    encryptedKey
                });

            expect(res.statusCode).toEqual(httpStatus.BAD_REQUEST);
            expect(res.body).toHaveProperty('errors');
        });

        test("Should fail to decrypt data payload as encrypted data field is not string type", async () => {
            const dummyEncryptedDataInt = 321;
            const dummyEncryptedDataBoolean = false;

            const resInt = await request(app).post(`/v1/symEncrypt/geth/decryptData`)
                .send({
                    encryptedKey,
                    encryptedData: dummyEncryptedDataInt
                });

            expect(resInt.statusCode).toEqual(httpStatus.BAD_REQUEST);
            expect(resInt.body).toHaveProperty('errors');

            const resBoolean = await request(app).post(`/v1/symEncrypt/geth/decryptData`)
                .send({
                    encryptedKey,
                    encryptedData: dummyEncryptedDataBoolean
                });

            expect(resBoolean.statusCode).toEqual(httpStatus.BAD_REQUEST);
            expect(resBoolean.body).toHaveProperty('errors');
        });

        test("Should fail to decrypt data payload as encrypted key field does not exist", async () => {

            const res = await request(app).post(`/v1/symEncrypt/geth/decryptData`)
                .send({
                    encryptedData
                });

            expect(res.statusCode).toEqual(httpStatus.BAD_REQUEST);
            expect(res.body).toHaveProperty('errors');
        });

        test("Should fail to decrypt data payload as encrypted key field is not string type", async () => {
            const dummyEncryptedKeyInt = 654;
            const dummyEncryptedKeyBoolean = true;

            const resInt = await request(app).post(`/v1/symEncrypt/geth/decryptData`)
                .send({
                    encryptedKey : dummyEncryptedKeyInt,
                    encryptedData
                });

            expect(resInt.statusCode).toEqual(httpStatus.BAD_REQUEST);
            expect(resInt.body).toHaveProperty('errors');

            const resBoolean = await request(app).post(`/v1/symEncrypt/geth/decryptData`)
                .send({
                    encryptedKey : dummyEncryptedKeyBoolean ,
                    encryptedData
                });

            expect(resBoolean.statusCode).toEqual(httpStatus.BAD_REQUEST);
            expect(resBoolean.body).toHaveProperty('errors');
        });

    });

});