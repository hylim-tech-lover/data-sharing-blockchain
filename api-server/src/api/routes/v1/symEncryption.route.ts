import express from 'express';
import { checkSchema } from 'express-validator';

import {merchantKeySchema} from '../../validations';
import {symEncryptionController} from '../../controllers';

const router = express.Router();
/* API for Geth */
router.get('/geth/checkIfExist/:merchantId', symEncryptionController.checkIfRecordExist);
router.post('/geth/encryptData', checkSchema(merchantKeySchema.merchantEncryptionKeySchema), symEncryptionController.encryptData);
router.post('/geth/decryptData', checkSchema(merchantKeySchema.merchantDecryptionKeySchema), symEncryptionController.decryptData);

export default router;