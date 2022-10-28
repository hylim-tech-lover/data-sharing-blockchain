export const SqlQueries = {
    retrieveSmartContract: `SELECT id, merchantId ,contractAddress, createDate FROM ??
                            WHERE merchantId = ?
                            `,
    insertSmartContract: `INSERT INTO ??
        (merchantId, contractAddress)
        VALUES
        (?, ?)
        `,
    retrieveEncryptionKey: `SELECT id, merchantId ,encryptionKey, createDate FROM ??
                            WHERE merchantId = ?
                            `,
    insertEncryptionKey: `INSERT INTO ??
        (merchantId, encryptionKey)
        VALUES
        (?, ?)
        `
};