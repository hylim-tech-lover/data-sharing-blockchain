# Private Blockchain Implementation MVP

## Description

A private blockchain network is used to create an intranet system that allows sharing of anonymised data in real time on their own IT infrastructure. This allows verifiable proof for other implemnetation such as credit risk model where rely on transparent auditable data instead of reputation.

## Implementation components

- Indexer
- Smart contracts
- API
- Database
- Scripts

## Technical flow

1. Raw transaction data retrieved from data source via API or SDK (or equivalent origin source of data)

2. Automated script checks if merchant is already within the system (database) else if creates a new smart contract

3. `MerchantId` & corresponding `smart contract address` gets updated in database

4. Raw transaction data gets normalised, encrypted, hashed and pushed on to AWS S3 and URI of S3 file returns as response

5. Update hashed raw transaction data to merchant smart contract

6. Automated script routinely polls transaction from blockchain

7. Polled transactions get updated to MySQL for easier read when querying

8. API interaction retrieves information from MySQL
