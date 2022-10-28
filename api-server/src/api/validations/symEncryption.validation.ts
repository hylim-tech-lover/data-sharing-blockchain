import { Schema } from 'express-validator';

const merchantEncryptionKeySchema : Schema = {
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
    data: {
        in: ['body'],
        exists: {
            options: {checkFalsy: true},
            errorMessage: "Plain Text Data is required",
            bail: true
        }
    }
};

const merchantDecryptionKeySchema : Schema = {
    encryptedKey:{
        in: ['body'],
        exists: {
            options: {checkFalsy: true},
            errorMessage: "Encryption Key is required",
            bail: true
        },
        isString: {
            errorMessage : "Encryption Key must be string",
            bail: true
        }
    },
    encryptedData: {
        in: ['body'],
        exists: {
            options: {checkFalsy: true},
            errorMessage: "Encrypted Data is required",
            bail: true
        },
        isString: {
            errorMessage : "Encryption Key must be string",
            bail: true
        }
    }
};

export {
    merchantEncryptionKeySchema,
    merchantDecryptionKeySchema
};