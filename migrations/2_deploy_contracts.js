var Proceeds = artifacts.require("./Proceeds.sol");

module.exports = function(deployer) {
  deployer.deploy(Proceeds);
};
