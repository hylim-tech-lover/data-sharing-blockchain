import express from 'express';
import { checkSchema } from 'express-validator';

import {merchantSmartContractSchema} from '../../validations';
import {smartContractController} from '../../controllers';

const router = express.Router();

/* API for Goerli testnet */
router.get('/goerli/:merchantId', smartContractController.getContractAddressGoerli);
router.post('/goerli', checkSchema(merchantSmartContractSchema), smartContractController.insertContractAddressGoerli);

/* API for Geth */
router.get('/geth/:merchantId', smartContractController.getContractAddressGeth);
router.post('/geth', checkSchema(merchantSmartContractSchema), smartContractController.insertContractAddressGeth);

export default router;