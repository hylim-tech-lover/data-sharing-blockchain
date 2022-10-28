const axios = require('axios');
const fs = require('fs-extra');

// * Insert generated file path and file to load the encrypted data 
const GENERATED_TRANSACTION_PATH = '';
const GENERATE_TRANSACTION_FILE = '';

const API_HOST = 'localhost';
const API_PORT = 3000;

// POST API to decrypt data
async function decryptData(url, reqBody) {
    var result = null;

    await axios.post(url, {
        encryptedData: reqBody.encryptedData,
        encryptedKey: reqBody.encryptedKey
    })
        .then((res) => {
            result = res.data;
        })
        .catch(err => {
            console.log(err);
        });

    return result;
}

async function main() {
    const fileName = `${__dirname}/${GENERATED_TRANSACTION_PATH}/${GENERATE_TRANSACTION_FILE}`;
    // * Insert encryption key to decrypt the encrypted data
    const encryptionKey = '<insert your key here>';

    var encryptedData;
    try {
        encryptedData = fs.readJsonSync(fileName);
    } catch (error) {
        console.error(`Failed to retrieve encrypted data from ${fileName} with error: `, error);
    }

    const decryptRequestBody = {
        encryptedData: encryptedData.encryptData,
        encryptedKey: encryptionKey
    };

    const decryptUrl = `http://${API_HOST}:${API_PORT}/v1/symEncrypt/geth/decryptData`;

    const res = await decryptData(decryptUrl, decryptRequestBody); 

    if (res) {
        console.log("Response:", res);
        console.log("Plain text data in JSON:", JSON.parse(res.data))
    }

}

main();