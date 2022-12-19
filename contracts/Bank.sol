// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Bank {
    address public owner;
    mapping(address => uint256) public customerBalances;

    constructor() {
        owner = msg.sender;
    }

    struct TxLog {
        address user;
        address recipient;
        uint256 amount;
        string txType; // deposit or withdrawal
        uint256 time;
    }

    TxLog[] public allTransactions;

    event FundsDeposited(
        address indexed customer,
        uint256 indexed amount,
        uint256 indexed time
    );

    event FundsWithdrawn(
        address indexed customer,
        uint256 indexed amount,
        uint256 indexed time
    );

    event FundsTransfered(
        address indexed from,
        address indexed to,
        uint256 indexed amount,
        uint256 time
    );

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function depositFunds() external payable {
        require(msg.value > 0, "amount cannot be 0 or less");

        customerBalances[msg.sender] += msg.value;

        allTransactions.push(
            TxLog(
                msg.sender,
                address(this),
                msg.value,
                "deposit",
                block.timestamp
            )
        );

        emit FundsDeposited(msg.sender, msg.value, block.timestamp);
    }

    function withdrawFunds(uint256 _amount) external payable {
        require(_amount > 0, "amount cannot be 0 or less");

        //make sure customer withdrawal doesn't exceed deposits
        require(
            customerBalances[msg.sender] >= _amount,
            "You can't withdraw more than you have deposited"
        );

        (bool withdrawn, ) = payable(msg.sender).call{value: _amount}("");

        require(withdrawn, "There was an error - please try again");

        allTransactions.push(
            TxLog(
                msg.sender,
                msg.sender,
                msg.value,
                "withdrawal",
                block.timestamp
            )
        );

        emit FundsWithdrawn(msg.sender, msg.value, block.timestamp);
    }

    function transfer(address payable _to, uint256 _amount) internal {
        require(_amount > 0, "amount cannot be 0 or less");

        //make sure customer transfer doesn't exceed deposits
        require(
            customerBalances[msg.sender] >= _amount,
            "You can't transfer more than you have deposited"
        );

        (bool transferred, ) = _to.call{value: _amount}("");

        require(transferred, "There was an error - please try again");

        allTransactions.push(
            TxLog(msg.sender, _to, msg.value, "transfer", block.timestamp)
        );

        emit FundsTransfered(msg.sender, _to, _amount, block.timestamp);
    }

    function transferFromBank(address payable _to, uint256 _amount)
        public
        returns (bool success)
    {
        require(_to != address(0), "Can't send funds to a '0' address");
        
        transfer(_to, _amount);

        return success;
    }
}
