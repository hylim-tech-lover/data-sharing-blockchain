import CryptoJS from "crypto-js";
import httpStatus from 'http-status';

import { randomBytes } from 'crypto';
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { ResultSetHeader, RowDataPacket } from 'mysql2';

import {query} from '../utils/queryMySqlDB';
import { SqlQueries } from '../utils/sql.query';

const checkIfRecordExist = async (req : Request , res : Response, next : NextFunction) => {
  try {

    const result = await checkDBForEncryptionKey(req.params.merchantId);

    let status: boolean;

    if (result.length < 1) {
      status = false;
    }
    else {
      status = true;
    }

    res.json({
      status
    });

  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: `Error while getting encryption key for ${req.params.merchantId} from mySQL: ${err.message}`,
    });
    next(err);
  }
}

// Encrypt function
const encryptData = async (req : Request , res : Response, next : NextFunction) => {
  try {
    // Validate request body
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(httpStatus.BAD_REQUEST).json({
        errors: errors.array()
      })
    }

    const result = await checkDBForEncryptionKey(req.body.merchantId);

    let sharedKeyHex: string;
    // No entry in database
    if (result.length < 1) {
      // Generate encryption key [128-bits === 16-bytes]
      sharedKeyHex = randomBytes(16).toString('hex');

      // Store encryption key
      const updateResult = await query(SqlQueries.insertEncryptionKey,
        ['merchant_key_geth', req.body.merchantId, sharedKeyHex]) as ResultSetHeader;

      // If insert row failed
      if (! updateResult.affectedRows) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
          message: `Unexpected error while inserting new encryption key for ${req.body.merchantId}`
        })
      }
    }
    // If there is existing entry
    else {
      sharedKeyHex = result[0].encryptionKey;
    }

    // Convert hexstring back to Buffer
    const sharedKey = Buffer.from(sharedKeyHex, "hex") ;

    let plainData = req.body.data;
    if(typeof plainData === "object") {
      plainData = JSON.stringify(plainData);
    }

    const encryptedData = CryptoJS.AES.encrypt(plainData, sharedKey.toString()).toString();

    res.json({
      encryptData : encryptedData,
    });

  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: `Error while encrypting data for ${req.body.merchantId} : ${err.message}`,
    });
    next(err);
  }
}

// Decrypt function
const decryptData = async (req : Request , res : Response, next : NextFunction) => {
  try {
    // Validate request body
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(httpStatus.BAD_REQUEST).json({
        errors: errors.array()
      })
    }

    // Convert hexstring back to Buffer
    const sharedKey = Buffer.from(req.body.encryptedKey, "hex") ;

    const bytes = CryptoJS.AES.decrypt(req.body.encryptedData, sharedKey.toString());
    let plainText : string | null = bytes.toString(CryptoJS.enc.Utf8);

    let status: boolean;

    if (plainText.length > 0) {
      status = true;
    } else {
      status = false;
      plainText = null;
    }

    res.json({
      data: plainText,
      status
    });

  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: `Error while decrypting data using ${req.body.encryptedKey} : ${err.message}`,
    });
    next(err);
  }
}

const checkDBForEncryptionKey = async (merchantId: string) => {
  return await query(SqlQueries.retrieveEncryptionKey,
    ['merchant_key_geth', merchantId]
  ) as RowDataPacket[];
}

export {
  checkIfRecordExist,
  checkDBForEncryptionKey,
  encryptData,
  decryptData
}