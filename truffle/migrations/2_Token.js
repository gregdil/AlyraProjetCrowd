const DevToken = artifacts.require("DevToken");

module.exports = function (deployer) {    
    deployer.deploy(DevToken,"1000000000000000000000000000");
};
