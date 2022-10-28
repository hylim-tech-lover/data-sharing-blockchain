var md5 = require("md5");
const mysql = require("mysql2");
const contract = require("../smart-contract/artifacts/TransactionContract.sol/Transaction.json");

require("dotenv").config();

// create the connection to database
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

connection.connect(function (err) {
  if (err) {
    return console.error("error: " + err.message);
  }

  console.log("Connected to the MySQL server.");
});

const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider(process.env.NODE_URL);

const abi = contract.abi;

async function runIndexer() {
  // Get last tracked block number

  // If match found, store data in mysql

  let trackedBlockNumEnd = 7224103;
  let trackedBlockNumStart = 7223915;
  let transactionArray = [];

  let blockNum = await provider.getBlockNumber();
  // console.log('getBlockNumber', blockNum)

  for (var x = trackedBlockNumStart; x <= trackedBlockNumEnd; x++) {
    console.log("block", x);
    let block = await provider.getBlockWithTransactions(x);
    // console.log('block', block)

    let tx = block.transactions;
    // console.log('tx', tx)
    // console.log('tx', tx.length)

    const iface = new ethers.utils.Interface(abi);

    for (var i = 0; i < tx.length; i++) {
      try {
        let decodedData = iface.parseTransaction({
          data: tx[i].data,
          value: tx[i].value,
        });
        // console.log('decodedData', decodedData)

        let txHash = tx[i].hash;
        let blockHeight = tx[i].blockNumber;
        let txFrom = tx[i].from;
        let txTo = tx[i].to;

        let transaction = {
          txHash: txHash,
          blockHeight: blockHeight,
          // "data": tx[i].data,
          // "value": tx[i].value,
          from: txFrom,
          to: txTo,
        };

        let date = new Date();

        let sql =
          "INSERT INTO `transactions` (timestamp, block_height, tx_hash, tx_from, tx_to) VALUES (?,?,?,?,?)";
        let sqlArray = [date, blockHeight, txHash, txFrom, txTo];
        console.log("sqlArray", sqlArray);
        connection.query(sql, sqlArray, function (err, results, fields) {
          console.log("results", results); // results contains rows returned by server
          // console.log(fields); // fields contains extra meta data about results, if available

          // If you execute same statement again, it will be picked from a LRU cache
          // which will save query preparation time and give better performance
        });
        // connection.query(
        //   sql, [txHash, blockHeight, txFrom, txTo],
        //   function(err, results, fields) {
        //     console.log('results', results); // results contains rows returned by server
        //     // console.log('fields', fields); // fields contains extra meta data about results, if available
        //   }
        // );
        transactionArray.push(transaction);
        console.log("transaction", transaction);
      } catch (e) {
        // console.log(e);
      }
    }
  }

  console.log("transactionArray", transactionArray);
}

runIndexer();
