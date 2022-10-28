# Private Blockchain Implementation MVP - Smart Contract

## Description
Smart contract is a self-executing contract written into lines of code that automate workflow, triggering the next action when conditions are met. The code and the agreements contained therein exist across a distributed, decentralized blockchain network. The code controls the execution, and transactions are trackable and irreversible

Smart contracts permit trusted transactions and agreements to be carried out among disparate, anonymous parties without the need for a central authority, legal system, or external enforcement mechanism.

Hence, role-based access control is embedded into the smart contract to restrict any users without permission to execute workflow that is only allowed for authorized users. 

## Objective
- Modify or retrieve merchant ID of smart contract (each merchant = 1 smart contract)
- Store transaction on-chain for verification purpose 
- Retrieve transaction stored on-chain
- Role-based Access control (grant/revoke/renounce access)
- Self-destruct for storage optimization of blockchain

## Get started
The whole project directory can be break down into few major parts such as:
 |folder        | Description                                                                              
 |:------------:|:------------------------------------------------------------------------------------------
 | [`contracts`](contracts/)  |Folder that contains smart contracts that will be deployed to private blockchain for each merchant
 | [`test`](test/)       |Test files written in JavaScript to test contracts locally before deployed to blockchain  

1. Make sure [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) is installed.
2. Git clone the repository to local machine.
3. Enter `npm install` in terminal to install all required dependencies.
4. Enter `npx hardhat test` in terminal to execute unit test for smart contract. All tests should passed if there is no changes on the smart contract. 
5. Enter `npx hardhat compile` in terminal to generate the artifacts that will be stored in `artifacts` folder. The contents will then be used in [scripts](../scripts).
