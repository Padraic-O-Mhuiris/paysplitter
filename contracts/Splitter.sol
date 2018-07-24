pragma solidity ^0.4.24;

contract Splitter {
    
    address public owner;
    
    event SplitLog(
        address[] recipients,
        uint[] weights,
        address sender,
        uint value,
        uint splitValue,
        uint spill,
        uint timestamp
    );

    event SplitFixed(
        address[] recipients,
        uint[] values,
        uint timestamp
    )

    constructor() public {
        owner = msg.sender;
    }
    
    function() public payable {
        revert(); 
    }
    
    function splitEther(address[] recipients) public payable {
        uint spill = msg.value % recipients.length;
        uint transfer_balance = msg.value - spill;
        uint split_balance = transfer_balance / recipients.length;
        for(uint i = 0; i < recipients.length; i++) {
            recipients[i].transfer(split_balance);
        }
        
        if(spill != 0) {
            msg.sender.transfer(spill);
        }
        uint[] memory nullArray; 
        emit SplitLog(recipients, nullArray, msg.sender, msg.value, split_balance, spill, now);
    }
    
    function getArrSum(uint[] arr) internal pure returns (uint) {
        uint arrSum = 0;
        for(uint i = 0; i < arr.length; i++) {
            arrSum += arr[i];
        }
        
        return weightSum;
    }
    
    function splitEtherWeighted(address[] recipients, uint[] weights) public payable {
        require(recipients.length == weights.length);
        
        uint weightSum = getArrSum(weights);
        uint spill = msg.value % weightSum;
        uint transfer_balance = msg.value - spill;
        uint split_balance = transfer_balance / weightSum;
        
        for(uint i = 0; i < recipients.length; i++) {
            recipients[i].transfer(split_balance*weights[i]);
        }
        
        if(spill != 0) {
            msg.sender.transfer(spill);
        }
        
        emit SplitLog(recipients, weights, msg.sender, msg.value, split_balance, spill, now);
    }

    function splitEtherFixed(address[] recipients, uint[] amounts) public payable {
        require(recipients.length == amounts.length);
        require(msg.value == getArrSum(amounts));

        for(uint i = 0; i < recipients.length; i++) {
            recipients[i].transfer(amounts[i]);
        }

        emit SplitFixed(recipients, amounts, now);
    }
}