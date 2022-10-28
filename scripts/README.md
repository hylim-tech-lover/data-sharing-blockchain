# Private Blockchain Implementation MVP - Scripts

## Description

Scripts are the backend services that will be run periodically to update transactions from data sources in hash to blockchain alongside with other handling for error and exception.

Besides than that, there are other script that used to decrypt data and read transaction from smart contract based on merchant ID.

## Objective

- Store data hash and file uri on-chain for each merchant smart contract
- Smart contract creation for new merchant
- Encrypt data and store in off-chain that can be accessed with file uri
- Script to decrypt data for verifing the data are encrypted correctly
- Script to read the transaction stored in smart contract for verification purpose

## Get started

1. Make sure [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) is installed.
2. Make sure API server is running as stated [here](https://app.clickup.com/3713545/v/dc/3hag9-47007/3hag9-65807)
3. Make sure database server is running as stated [here](https://app.clickup.com/3713545/v/dc/3hag9-47007/3hag9-65787)
4. Git clone the repository to local machine.
5. Enter `npm install` in terminal to install all required dependencies.

### [`update_tx_script.js`](./update_tx_script.js)

1. `bytecode` and `abi` can be retrieved from [smart-contract](../smart-contract) folder upon `compiling the smart contract`.

   - In `smart-contract` folder, goes to `artifacts` > `contracts` > `TransactionContract.sol` > `TransactionContract.json` file.
   - Locate `abi` and `bytecode` field in `TransactionContract.json` file.

   ```json
   {
     "..." : "...",
     "abi" : [{"input": [...]}],
     "bytecode" : "0x6..."
     "..." : "..."
   }
   ```

   - Copy the value of `abi` and `bytecode` and paste into the script.

2. `JSON_SOURCE_FILE` value can be changed with the corresponding data source file path. However, make sure it is a valid `JSON` object otherwise it will not work.
3. `GENERATED_TRANSACTION_PATH` can be anywhere in current file path. (eg: `generated_transaction`)
4. `url = "<insert Goerli testnet node endpoint here>"` required third-party service provider and Infura is used. **This can be skipped if script is not running in Goerli testnet**[`node update_tx_script.js`].

   - Register an account in [Infura](https://infura.io/) or login if you have existing account.
   - Create project as [shown here](https://docs.infura.io/infura/getting-started).
   - Select `GÖRLI` under Ethereum network endpoints.
   - Copy the url and paste to `url` above. [eg: url = "https://..."]

5. `var walletPrivateKey = new ethers.Wallet('<insert private key here>')`

   - **_1. Private blockchain_**
   - Make sure [private blockchain](https://app.clickup.com/3713545/v/dc/3hag9-47007/3hag9-65607) is launched and miner account is unlocked.
   - Follow [guide here](https://www.coindesk.com/learn/how-to-set-up-a-metamask-wallet/) to install Metamask on browser and create new wallet
   - Follow [link here](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key) to retrieve private key from Metamask
   - Follow [guide here](https://metaschool.so/articles/how-to-change-add-new-network-metamask-wallet) to add new network
   - Type the following detail for new network:

   ```
   Network Name : Private Chain <or anything that is preferred>
   New RPC URL : http://localhost:8515
   Chain ID : 616
   Currency Symbol : PrivEth <or anything that is preferred>
   ```

   - Follow [guide here](https://app.clickup.com/3713545/v/dc/3hag9-47007/3hag9-65607) to send ETH to Metamask account (copy the address of Metamask account). Ideally, 1 Ether or above is recommended to provide a seamless experience.
   - Make sure private blockchain is online all this time. Otherwise, all ethers received by Metamask account will disappear and previous step have to be repeated.

   - **_2. Goerli testnet_**
   - Get Goerli Ethereum by going to Goerli `testnet faucet`

#### Execute script

1. `node update_tx_script.js` - Run the script to interact with **private blockchain**
2. `node update_tx_script.js -t` - Run the script to interact with **Goerli testnet**

### [`read_tx_script.js`](./read_tx_script.js)

1. `abi` can be retrieved the same way as stated above.
2. `const address = "<insert smart contract address here>"`

   - Retrieve data entries of database server as stated [here](https://app.clickup.com/3713545/v/dc/3hag9-47007/3hag9-65787)
   - Insert the value from `contractAddress` column from database server that associated with desired `merchantId` column value. [eg: const address = "0x7A..."]

3. `var walletPrivateKey = new ethers.Wallet('<insert private key here>')` can be retrieved the same way as stated above.

> Execute script command in terminal : `node read_tx_script.js`

### [`decrypt_data_script.js`](./decrypt_data_script.js)

1. `GENERATED_TRANSACTION_PATH` have to be the same as stated in [`update_tx_script.js`](#update_tx_scriptjs)
2. `const encryptionKey = '<insert your key here>'`

   - Retrieve data entries of database server as stated [here](https://app.clickup.com/3713545/v/dc/3hag9-47007/3hag9-65787)
   - Insert the value from `encryptionKey` column from database server that associated with desired `merchantId` column value. [eg: const encryptionKey = "d085..."] with **_merchantId_** of `60cc..deu`

3. `GENERATE_TRANSACTION_FILE` have to be 1 of the files contained in `GENERATED_TRANSACTION_PATH` with same `merchantId` stated in 2.

   - [file naming convention: `{merchantId}`_`{timestamp in epoch}`.json]
   - (eg: `60cc..deu_177..99.json`)

> Execute script command in terminal : `node decrypt_data_script.js`
