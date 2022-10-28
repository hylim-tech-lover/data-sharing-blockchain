// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract TransactionContract is AccessControlEnumerable {
    using Counters for Counters.Counter;

    struct Transaction {
        string dataHash;
        string uri;
        string note;
    }

    string private _merchantId;
    Counters.Counter private _totalTransaction;
    Transaction[] public transactions;

    event AddTransaction(
        address indexed executor,
        string dataHash,
        string uri,
        string note
    );
    event ChangeMerchantId(address indexed executor, string merchantId);

    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    constructor(string memory merchantId) {
        require(
            _totalTransaction.current() == 0,
            "Transaction count is not empty during initialization."
        );
        require(bytes(merchantId).length > 0, "Merchant Id is empty.");

        _setRoleAdmin(EXECUTOR_ROLE, EXECUTOR_ROLE);
        _setupRole(EXECUTOR_ROLE, msg.sender);

        _merchantId = merchantId;
    }

    modifier onlyExecutor() {
        if (!isAuthorized(msg.sender)) {
            revert(
                string(
                    abi.encodePacked(
                        "AccessControl: account ",
                        Strings.toHexString(uint160(msg.sender), 20),
                        " is not authorized."
                    )
                )
            );
        }
        _;
    }

    function isAuthorized(address from)
        public
        view
        returns (bool _isAuthorized)
    {
        _isAuthorized = hasRole(EXECUTOR_ROLE, from);
    }

    function grantExecutorRole(address account) external onlyExecutor {
        grantRole(EXECUTOR_ROLE, account);
    }

    function revokeExecutorRole(address account) external onlyExecutor {
        require(
            isAuthorized(account),
            "Account is not authorized and do not need to be revoked."
        );
        require(
            getRoleMemberCount(EXECUTOR_ROLE) > 1,
            "Cannot revoke last authorized account! Please add more executor before proceed."
        );
        revokeRole(EXECUTOR_ROLE, account);
    }

    function renounceExecutorRole() external onlyExecutor {
        require(
            getRoleMemberCount(EXECUTOR_ROLE) > 1,
            "Cannot renounce last authorized account! Please add more executor before proceed."
        );
        renounceRole(EXECUTOR_ROLE, msg.sender);
    }

    function getMerchantId() external view returns (string memory merchantId) {
        merchantId = _merchantId;
    }

    function setMerchantId(string memory merchantId) external onlyExecutor {
        require(bytes(merchantId).length > 0, "Merchant Id is empty.");
        _merchantId = merchantId;
        emit ChangeMerchantId(msg.sender, merchantId);
    }

    function getTotalTransactionCount() external view returns (uint256 count) {
        count = _totalTransaction.current();
    }

    function getTransactionByIndex(uint256 index)
        external
        view
        returns (Transaction memory transaction)
    {
        require(
            index < _totalTransaction.current(),
            "Index cannot be larger than the current total transaction count in smart contract"
        );
        transaction = transactions[index];
    }

    function addTransaction(
        string memory _dataHash,
        string memory _uri,
        string memory _note
    ) external onlyExecutor {
        require(bytes(_dataHash).length > 0, "dataHash is empty.");
        require(bytes(_uri).length > 0, "uri is empty.");
        // Do we need to make sure notes is not empty or feed in default value for notes
        transactions.push(
            Transaction({dataHash: _dataHash, uri: _uri, note: _note})
        );
        _totalTransaction.increment();
        emit AddTransaction(msg.sender, _dataHash, _uri, _note);
    }

    function destroySmartContract(address payable _to) external onlyExecutor {
        selfdestruct(_to);
    }
}
