import httpStatus from 'http-status';
import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { ResultSetHeader, RowDataPacket } from 'mysql2';

import {query} from '../utils/queryMySqlDB';
import {SqlQueries} from '../utils/sql.query';

class ResponseBody {
  message: string;
  status: boolean;
}

const getContractAddressGoerli = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const result = await query(SqlQueries.retrieveSmartContract,
      ['merchant_smart_contract_goerli', req.params.merchantId]) as RowDataPacket[];

    if (result.length < 1) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: `${req.params.merchantId} not found`
      });
    }

    else {
      res.json(result[0]);
    }

  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: `Error while getting Goerli smart contract address from mySQL: ${err.message}`,
    });
    next(err);
  }
}

const insertContractAddressGoerli = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(httpStatus.BAD_REQUEST).json({
        errors: errors.array()
      })
    }

    const queryResult = new ResponseBody();

    const result = await query(SqlQueries.insertSmartContract ,
      ['merchant_smart_contract_goerli', req.body.merchantId, req.body.contractAddress]
    ) as ResultSetHeader;

    if (result.affectedRows) {
      queryResult.message = 'Smart contract address inserted successfully';
      queryResult.status = true;

    } else {
      queryResult.message = 'Error in inserting smart contract address';
      queryResult.status = false;
    }

    res.json(queryResult);

  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: `Error while insert Goerli smart contract address to mySQL: ${err.message}`,
    });
    next(err);
  }
}

const getContractAddressGeth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query(SqlQueries.retrieveSmartContract,
      ['merchant_smart_contract_geth',
        req.params.merchantId]
    ) as RowDataPacket[];

    if (result.length < 1) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: `${req.params.merchantId} not found`
      });
    }
    else {
      res.json(result[0]);
    }

  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: `Error while getting Geth smart contract address from mySQL: ${err.message}`,
    });
    next(err);
  }
}

const insertContractAddressGeth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(httpStatus.BAD_REQUEST).json({
        errors: errors.array()
      })
    }

    const queryResult = new ResponseBody();

    const result = await query(SqlQueries.insertSmartContract,
      ['merchant_smart_contract_geth', req.body.merchantId, req.body.contractAddress]
    ) as ResultSetHeader;

    if (result.affectedRows) {
      queryResult.message = 'Smart contract address inserted successfully';
      queryResult.status = true;

    } else {
      queryResult.message = 'Error in inserting smart contract address';
      queryResult.status = false;
    }

    res.json(queryResult);

  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: `Error while insert Geth smart contract address to mySQL: ${err.message}`,
    });
    next(err);
  }
}

export {
  getContractAddressGoerli,
  insertContractAddressGoerli,
  getContractAddressGeth,
  insertContractAddressGeth
}