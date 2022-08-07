const Staking = artifacts.require("Staking");
const DevToken = artifacts.require("DevToken");

const annualRewardRate = 150;
const cooldown = 1;
const minimumReward = 0;

module.exports = async function (deployer) {
  var tokenContract = await DevToken.deployed();
  var tokenAddress = tokenContract.address;

  await deployer.deploy(
    Staking,
    annualRewardRate,
    cooldown,
    minimumReward,
    tokenAddress
  );

  const stakingContract = await Staking.deployed();

  // Ajout des token au smartContract
  var token = await DevToken.at(tokenAddress);
  await token.claim(stakingContract.address, "1000000000000000000000000000");
};
