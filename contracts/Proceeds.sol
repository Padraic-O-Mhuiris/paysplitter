pragma solidity ^0.4.24;

contract Proceeds {
    
    address public owner;
    
    event payLog(
        address[] recipients,
        uint[] weights,
        address sender,
        uint value,
        uint splitValue,
        uint spill,
        uint timestamp
    );

    event payLogFixed(
        address[] recipients,
        uint[] values,
        uint timestamp
    );

    constructor() public {
        owner = msg.sender;
    }
    
    function() public payable {
        revert(); 
    }

    function getArrSum(uint[] arr) internal pure returns (uint) {
        uint arrSum = 0;
        for(uint i = 0; i < arr.length; i++) {
            arrSum += arr[i];
        }
        
        return arrSum;
    }
    
    function payEther(address[] recipients) public payable {
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
        emit payLog(recipients, nullArray, msg.sender, msg.value, split_balance, spill, now);
    }
        
    function payEtherWeighted(address[] recipients, uint[] weights) public payable {
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
        
        emit payLog(recipients, weights, msg.sender, msg.value, split_balance, spill, now);
    }

    function payEtherFixed(address[] recipients, uint[] amounts) public payable {
        require(recipients.length == amounts.length);
        require(msg.value == getArrSum(amounts));

        for(uint i = 0; i < recipients.length; i++) {
            recipients[i].transfer(amounts[i]);
        }

        emit payLogFixed(recipients, amounts, now);
    }
}