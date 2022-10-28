const { ethers } = require("ethers");
const contract = require("../smart-contract/artifacts/TransactionContract.sol/Transaction.json");

const url = "http://localhost:8515";
const provider = new ethers.providers.JsonRpcProvider(url);

const abi = contract.abi;

const address = "<insert smart contract address here>"; // Smart contract address

async function asyncRead() {
  var walletPrivateKey = new ethers.Wallet("insert private key here");
  // console.log('Wallet Private Key: ', walletPrivateKey);

  var wallet = walletPrivateKey.connect(provider);
  // var wallet_address = walletPrivateKey.address;
  // console.log('Wallet address: ', wallet_address);

  const contract = new ethers.Contract(address, abi, wallet);

  var totalCount = await contract.getTotalTransactionCount();

  var totalCount = await contract.getTotalTransactionCount();
  console.log("totalCount: ", totalCount.toNumber());

  // Read all transactions
  for (i = 0; i < totalCount; i++) {
    // var readTx = await contract.getTransactionByIndex(i);
    // console.log('readTx', i + 1, ': ', readTx);

    var redTx = await contract.transactions(i);
    console.log(redTx);
  }
}

asyncRead();
