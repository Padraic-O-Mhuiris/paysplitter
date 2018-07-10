pragma solidity ^0.4.24;

contract Splitter {
    
    event SplitLog(
        address[] recipients,
        uint[] weights,
        address sender,
        uint value,
        uint splitValue,
        uint spill,
        uint timestamp
    );
    
    function () public payable {
        revert () ; 
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
        emit SplitLog(recipients, nullArray, msg.sender, msg.value, split_balance, spill, block.timestamp);
    }
    
    function getWeightSum(uint[] weights) internal pure returns (uint) {
        uint weightSum = 0;
        for(uint i = 0; i < weights.length; i++) {
            weightSum += weights[i];
        }
        
        return weightSum;
    }
    
    function splitEtherWeighted(address[] recipients, uint[] weights) public payable {
        require(recipients.length == weights.length);
        
        uint weightSum = getWeightSum(weights);
        uint spill = msg.value % weightSum;
        uint transfer_balance = msg.value - spill;
        uint split_balance = transfer_balance / weightSum;
        
        for(uint i = 0; i < recipients.length; i++) {
            recipients[i].transfer(split_balance*weights[i]);
        }
        
        if(spill != 0) {
            msg.sender.transfer(spill);
        }
        
        emit SplitLog(recipients, weights, msg.sender, msg.value, split_balance, spill, block.timestamp);
    }
}