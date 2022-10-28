const { ethers } = require("ethers");
const md5 = require("md5");
const axios = require("axios");
const fs = require("fs-extra");
const command_parser = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const httpStatus = require("http-status");

const bytecode = "<insert bytecode here>";
const contract = require("../smart-contract/artifacts/TransactionContract.sol/Transaction.json");

const abi = contract.abi;

const JSON_SOURCE_FILE = "./data_sources/dummy-transactions-modified.json";
// * Insert generated file path
const GENERATED_TRANSACTION_PATH = "";

const API_HOST = "localhost";
const API_PORT = 3000;

var url;
var API_ADDR_GET_ENDPOINT;
var API_ADDR_POST_ENDPOINT;

// Parse command line argument
const argv = command_parser(hideBin(process.argv))
  .option("testnet", {
    type: "boolean",
    alias: "t",
    describe: "Running scripts for Goerli testnet",
  })
  .help()
  .parse();

// Goerli testnet parameters
if (argv.testnet) {
  url = "<insert Goerli testnet node endpoint here>";
  API_ADDR_GET_ENDPOINT = "v1/merchant/goerli";
  API_ADDR_POST_ENDPOINT = "v1/merchant/goerli";
}
// Private chain parameters
else {
  url = "http://localhost:8515";
  API_ADDR_GET_ENDPOINT = "v1/merchant/geth";
  API_ADDR_POST_ENDPOINT = "v1/merchant/geth";
}

// console.log('RPC Provider',url);
// console.log('GET API endpoint:', API_ADDR_GET_ENDPOINT);
// console.log('POST API endpoint:', API_ADDR_POST_ENDPOINT);

const provider = new ethers.providers.JsonRpcProvider(url);

// Generate hash based on the generated off-chain data (store in S3)
function generateHashData(json) {
  //remove whitespace from json
  var data = JSON.stringify(json).trim();
  console.log("JSON data: ", data);

  var hash = md5(data);
  console.log("data hash:", hash);

  return hash;
}

// GET API to retrieve smart contract based on merchant ID
async function getContractAddress(url) {
  var status = null,
    data = null;

  await axios
    .get(url)
    .then((res) => {
      // const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
      // console.log('Status Code:', res.status);
      // console.log('Date in Response header:', headerDate);
      status = res.status;
      data = res.data;
    })
    .catch((err) => {
      if (err.response && err.response.status === httpStatus.NOT_FOUND) {
        status = err.response.status;
        data = err.response.data;
      } else {
        console.log("Error: ", err.message);
      }
    });

  return { status, data };
}

// POST API to update smart contract address to database based on merchant ID
async function insertContractAddress(url, reqBody) {
  var result = null;

  await axios
    .post(url, {
      merchantId: reqBody.merchantId,
      contractAddress: reqBody.contractAddress,
    })
    .then((res) => {
      result = res.data;
    })
    .catch((err) => {
      console.log(err);
    });

  return result;
}

// POST API to encrypt data
async function encryptData(url, reqBody) {
  var result = null;

  await axios
    .post(url, {
      merchantId: reqBody.merchantId,
      data: reqBody.data,
    })
    .then((res) => {
      result = res.data;
    })
    .catch((err) => {
      console.log(err);
    });

  return result;
}

async function pollTransaction() {
  // 1. Process and filter raw JSON data from S3
  // Read JSON data from file
  var rawJson;

  try {
    rawJson = fs.readJsonSync(JSON_SOURCE_FILE);
  } catch (error) {
    console.error(
      `Failed to retrieve data from ${JSON_SOURCE_FILE} with error: `,
      error
    );
  }

  // 1.1. Verify it is valid JSON object
  if (rawJson && typeof rawJson === "object") {
    // 1.2 Sort JSON array with key='item' based on timestamp ascendingly
    rawJson.items.sort((a, b) => {
      return new Date(a.created) - new Date(b.created);
    });

    const dummyJson = rawJson.items.slice(0, 1);
    rawJson.items = dummyJson;
    const count = dummyJson.length;
    // const count = rawJson.items.length;
    console.log("Total transaction count: ", count);

    var walletPrivateKey = new ethers.Wallet("<insert private key here>");

    //console.log('Wallet Private Key: ', walletPrivateKey);

    var wallet = walletPrivateKey.connect(provider);
    //var wallet_address = walletPrivateKey.address;
    //console.log('Wallet address: ', wallet_address);

    // 1.3 Loop through all transaction in the transaction record
    for (i = 0; i < count; i++) {
      const transaction = rawJson.items[i];
      // 1.4 Generate JSON object based on specification
      var filtered_json = new Object();
      filtered_json.merchantId = transaction.merchantId;
      filtered_json.platformTxId = transaction.id;
      // Convert datetime to epoch format
      filtered_json.created = Date.parse(transaction.created);
      filtered_json.amount = transaction.amount;
      filtered_json.currency = transaction.currency;
      filtered_json.state = transaction.state;
      filtered_json.note = "-";

      //console.log(filtered_json);

      // 1.5 Hash filtered json above
      const dataHash = generateHashData(filtered_json);

      // 2. Validate each transaction merchantId with database entry and insert new entry if is new merchant
      // 2.1 Check whether there is existing smart contract address based on merchantId

      var api_url = `http://${API_HOST}:${API_PORT}/${API_ADDR_GET_ENDPOINT}/${filtered_json.merchantId}`;
      var result = await getContractAddress(api_url);

      if (result.status === httpStatus.NOT_FOUND) {
        // 2.2 Create new smart contract since it is new user
        console.log("New merchant", filtered_json.merchantId);
        console.log("Creating new smart contract..");

        const factory = new ethers.ContractFactory(abi, bytecode, wallet);
        const deploy_contract = await factory.deploy(filtered_json.merchantId);
        address = deploy_contract.address;
        await deploy_contract.deployTransaction.wait();

        // Make sure smart contract address is valid
        if (address) {
          // 2.3 Store new smart contract address to the database together with merchantId

          api_url = `http://${API_HOST}:${API_PORT}/${API_ADDR_POST_ENDPOINT}`;

          const addAdrrRequestBody = {
            merchantId: filtered_json.merchantId,
            contractAddress: address,
          };

          var res = await insertContractAddress(api_url, addAdrrRequestBody);

          if (res && res.status === true) {
            console.log("Deployed smart contract address: ", address);
          } else {
            if (res) {
              console.log(res);
            }
            break;
          }
        } else {
          console.log("Invalid smart contract address. Exiting scripts..");
          break;
        }
      } else if (result.data) {
        address = result.data.contractAddress;
      } else {
        console.log("Terminating script as error occured.");
        return;
      }

      console.log(
        "Adding new transaction to merchant ID: ",
        filtered_json.merchantId,
        " with smart contract address: ",
        address
      );

      // 3: Generate JSON file
      const filename = `${filtered_json.merchantId}_${filtered_json.created}.json`;
      const file = `${__dirname}/${GENERATED_TRANSACTION_PATH}/${filename}`;

      try {
        const generated_json = {
          data: filtered_json,
          dataHash: dataHash,
        };

        const encryptRequestBody = {
          merchantId: filtered_json.merchantId,
          data: JSON.stringify(generated_json),
        };

        const encryptUrl = `http://${API_HOST}:${API_PORT}/v1/symEncrypt/geth/encryptData`;
        const res = await encryptData(encryptUrl, encryptRequestBody);

        if (res) {
          // console.log("Encrypted data:", res.encryptData);
          fs.outputJSONSync(file, res);
          const file_uri = `file:///${file}`;
          console.log(`File uploaded at: ${file_uri}`);

          // 4. Append transaction to smart contract
          contract = new ethers.Contract(address, abi, wallet);
          var writeTx = await contract.addTransaction(
            dataHash,
            file_uri,
            "Test"
          );
          console.log("writeTx: ", writeTx);
          var txStatus = await writeTx.wait();
          console.log("status: ", txStatus);
        }
      } catch (error) {
        console.error(
          `Failed to save data/update transaction to ${file} with error: ${error}`
        );
      }
    }
  } else {
    console.log("Invalid JSON. Make sure input data to be valid JSON.");
  }
}

pollTransaction();
