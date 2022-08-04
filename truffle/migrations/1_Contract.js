const Staking = artifacts.require("Staking");
const annualRewardRate = 150;
const cooldown = 10;
const minimumReward = 0;

module.exports = function (deployer) {
  deployer.deploy(Staking, annualRewardRate, cooldown, minimumReward);
};
