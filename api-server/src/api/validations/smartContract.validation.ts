import { Schema } from 'express-validator';

export const merchantSmartContractSchema : Schema = {
    merchantId:{
        in: ['body'],
        exists: {
            options: {checkFalsy: true},
            errorMessage: "Merchant ID is required",
            bail: true
        },
        isString: {
            errorMessage : "Merchant ID must be string",
            bail: true
        }
    },
    contractAddress: {
        in: ['body'],
        exists: {
            options: {checkFalsy: true},
            errorMessage: "Smart contract address is required",
            bail: true
        },
        isString: {
            errorMessage : "Smart contract address must be string",
            bail: true
        }
    }
};