const { expect } = require("chai");

describe("Basic functionality with admin/executor role", function () {
  it("Should not deploy with empty merchantId", async function () {
    const emptyMerchantId = "";
    [owner] = await ethers.getSigners();
    const Transaction = await hre.ethers.getContractFactory(
      "TransactionContract"
    );
    await expect(Transaction.deploy(emptyMerchantId)).to.be.reverted;
  });

  beforeEach(async function () {
    const dummyMerchantId = "dba0801";
    [owner] = await ethers.getSigners();
    const Transaction = await hre.ethers.getContractFactory(
      "TransactionContract"
    );
    contract = await Transaction.deploy(dummyMerchantId);
  });

  it("Should successfully deployed with non-empty merchantID", async function () {});

  it("Should update non-zero merchantId to smart contract", async function () {
    const newMerchantId = "dba8010";
    await expect(contract.setMerchantId(newMerchantId))
      .to.emit(contract, "ChangeMerchantId")
      .withArgs(owner.address, newMerchantId);
    expect(await contract.getMerchantId()).to.equal(newMerchantId);
  });

  it("Should add valid transaction successfully and emit AddTransaction event", async function () {
    const dataHash = "xxxyyy";
    const uri = "http://testing";
    const note = "Test";

    await expect(contract.addTransaction(dataHash, uri, note))
      .to.emit(contract, "AddTransaction")
      .withArgs(owner.address, dataHash, uri, note);

    const txData = await contract.getTransactionByIndex(0);
    expect(await contract.getTotalTransactionCount()).to.equal(1);
    expect(txData.dataHash).to.equal(dataHash);
    expect(txData.uri).to.equal(uri);
    expect(txData.note).to.equal(note);
  });

  it("Should revert if accessing transaction index that execeeded current transaction count", async function () {
    const txCount = await contract.getTotalTransactionCount();
    // Index of transaction started with 0 and hence we should use txCount - 1 to access. However, we will pass in txCount directly to revert the tx
    await expect(contract.getTransactionByIndex(txCount)).to.be.revertedWith(
      "Index cannot be larger than the current total transaction count in smart contract"
    );
  });

  it("Should revert if dataHash in transaction is empty", async function () {
    const dataHash = "";
    const uri = "http://testing";
    const note = "Test";

    await expect(
      contract.addTransaction(dataHash, uri, note)
    ).to.be.revertedWith("dataHash is empty.");
  });

  it("Should revert if uri in transaction is empty", async function () {
    const dataHash = "xxxyyy";
    const uri = "";
    const note = "Test";

    await expect(
      contract.addTransaction(dataHash, uri, note)
    ).to.be.revertedWith("uri is empty.");
  });

  it("Should self-destruct and revert any basic functions in smart contract", async function () {
    await contract.destroySmartContract(owner.address);

    await expect(contract.getTotalTransactionCount()).to.be.reverted;
    await expect(contract.getMerchantId()).to.be.reverted;
    await expect(contract.getTransactionByIndex("123")).to.be.reverted;
  });
});

describe("Role-based related functionality", function () {
  beforeEach(async function () {
    const dummyMerchantId = "dba0801";
    [owner, account1, account2] = await ethers.getSigners();
    const Transaction = await hre.ethers.getContractFactory(
      "TransactionContract"
    );
    contract = await Transaction.deploy(dummyMerchantId);
  });

  it("Should return true for verification function with admin/executor role", async function () {
    expect(await contract.isAuthorized(owner.address)).to.be.equal(true);
  });

  it("Should return false for verification function with non-admin/executor role", async function () {
    expect(await contract.isAuthorized(account1.address)).to.be.equal(false);
  });

  it("Should be able to grant admin/executor role to other account with admin/executor role", async function () {
    await expect(
      contract.grantExecutorRole(account1.address, { from: owner.address })
    ).to.emit(contract, "RoleGranted");
    await expect(
      contract.grantExecutorRole(account2.address, { from: owner.address })
    ).to.emit(contract, "RoleGranted");
  });

  it("Should not be able to grant admin/executor role to other account with non-admin/executor role", async function () {
    await expect(
      contract.grantExecutorRole(account1.address, { from: account2.address })
    ).to.be.reverted;
    await expect(
      contract.grantExecutorRole(owner.address, { from: account2.address })
    ).to.be.reverted;

    await expect(
      contract.grantExecutorRole(owner.address, { from: account1.address })
    ).to.be.reverted;
    await expect(
      contract.grantExecutorRole(account2.address, { from: account1.address })
    ).to.be.reverted;
  });

  it("Should be able to revoke admin/executor role from existing admin/executor account with admin/executor role", async function () {
    await contract.grantExecutorRole(account1.address, { from: owner.address });
    await expect(
      contract.revokeExecutorRole(account1.address, { from: owner.address })
    ).to.emit(contract, "RoleRevoked");
  });

  it("Should not be able to revoke admin/executor role from admin/executor account with non-admin/executor role", async function () {
    await contract.grantExecutorRole(account1.address, { from: owner.address });
    await expect(
      contract.revokeExecutorRole(account1.address, { from: account2.address })
    ).to.be.reverted;
  });

  it("Should revert when revoking admin/executor role from non-admin/executor account with admin/executor role", async function () {
    await expect(
      contract.revokeExecutorRole(account1.address, { from: owner.address })
    ).to.be.revertedWith(
      "Account is not authorized and do not need to be revoked."
    );
  });

  it("Should revert when revoking last admin/executor role from admin/executor account with admin/executor role", async function () {
    await expect(
      contract.revokeExecutorRole(owner.address, { from: owner.address })
    ).to.be.revertedWith(
      "Cannot revoke last authorized account! Please add more executor before proceed."
    );
  });

  it("Should be able to renounce admin/executor role for existing admin/executor account", async function () {
    await contract.grantExecutorRole(account1.address, { from: owner.address });
    await expect(contract.connect(account1).renounceExecutorRole()).to.emit(
      contract,
      "RoleRevoked"
    );
    expect(await contract.isAuthorized(account1.address)).to.be.equal(false);
  });

  it("Should revert when renouncing admin/executor role for non-existing admin/executor account", async function () {
    await expect(contract.connect(account1).renounceExecutorRole()).to.be
      .reverted;
  });

  it("Should revert when renouncing last admin/executor role for existing admin/executor account", async function () {
    await expect(contract.renounceExecutorRole()).to.be.revertedWith(
      "Cannot renounce last authorized account! Please add more executor before proceed."
    );
  });
});
