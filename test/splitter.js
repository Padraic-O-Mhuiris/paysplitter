const Splitter = artifacts.require("Splitter")
var BigNumber = require('bignumber.js');

function getEthSpentTX(tx) {
    var gu = tx.receipt.gasUsed
    var gp = (web3.eth.getTransaction(tx.tx).gasPrice).times(new BigNumber(10).pow(-18))
    return gu * gp
}

function getBalance(accounts, index) {
    return web3.eth.getBalance(accounts[index]).times(new BigNumber(10).pow(-18))
}

contract('Eth Split', function(accounts) {
    
    let splitter
    let balances = []
    let _gas = 55000

    beforeEach('setup contract for each test', async function () {
        splitter = await Splitter.new()
    })

    it('has an owner', async function () {
        assert.equal(await splitter.owner(), accounts[0])
    })

    it('splits evenly', async function() {
        var spender = accounts[1]
        var receivers = accounts.slice(2, 4)

        console.log("Balances ------------------------------")
        console.log(getBalance(accounts, 1).toString())
        console.log(getBalance(accounts, 2).toString())
        console.log(getBalance(accounts, 3).toString())  
        console.log()   

        console.log("Balance before transaction -------------")
        console.log("     " + getBalance(accounts, 1).toString() + "\n")
        var n = getBalance(accounts, 1)

        var _val = web3.toWei('0.000000000000000003', 'ether');
        console.log("Value to be split ----------------------")
        console.log("     " + _val + " wei\n")

        var tx = await splitter.splitEther(receivers, {from:spender, value:_val})

        console.log("Balance after transaction -------------")
        console.log("     " + getBalance(accounts, 1).toString() + "\n")

        var diff = (new BigNumber(n)).sub((getBalance(accounts, 1)))

        console.log("Difference ----------------------------")
        console.log("     " + diff + "\n")

        console.log("Gas Price ------------------------------")
        console.log("     " + web3.eth.getTransaction(tx.tx).gasPrice + "\n")

        console.log("Gas Used ------------------------------")
        console.log("     " + tx.receipt.gasUsed + "\n")
        
        console.log("Gas Limit ------------------------------")
        console.log("     " + web3.eth.getBlock("latest").gasLimit + "\n")

        var ethSpent = getEthSpentTX(tx) 
        console.log("Eth Spent ------------------------------")
        console.log("     " + ethSpent + "\n")

        var valRemoved = diff.sub(ethSpent)
        console.log("Value removed ------------------------------")
        console.log("     " + valRemoved + "\n")

        var valReturned = (new BigNumber(_val)).times(new BigNumber(10).pow(-18)).sub(valRemoved)
        console.log("Value removed ------------------------------")
        console.log("     " + valReturned + "\n")

        console.log("Logs ----------------------------------")
        console.log(tx.logs[0].args)
        console.log()

        console.log("Transaction Receipt -------------------")
        console.log(tx)
        console.log()

        console.log("Transaction Object --------------------")
        console.log(web3.eth.getTransaction(tx.tx))
        console.log()

        console.log("Balances ------------------------------")
        console.log(getBalance(accounts, 1).toString())
        console.log(getBalance(accounts, 2).toString())
        console.log(getBalance(accounts, 3).toString())       
    })
    
})

