const Staking = artifacts.require("Staking");
const DevToken = artifacts.require("DevToken");
const { BN, expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");
const { expect } = require("chai");

contract("Staking", (accounts) => {
  const owner = accounts[0];
  const staker = accounts[1];
  const newStaker = accounts[2];
  const oldStaker = accounts[3];
  const nonStaker = accounts[4];
  const annualRewardRate = new BN(150);
  const cooldown = new BN(10);
  const minimumReward = new BN(0);

  function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  let StakingInstance;

  // ----------- ACTIVE POOL --------------//

  describe("Registering new staker", () => {
    let dateOfFirstStack;
    before(async () => {
      let tokenContract = await DevToken.deployed();
      let tokenAddress = tokenContract.address;
      StakingInstance = await Staking.new(
        annualRewardRate,
        cooldown,
        minimumReward,
        tokenAddress,
        { from: owner }
      );
      await StakingInstance.stake({
        from: newStaker,
        value: web3.utils.toWei("5", "ether"),
      });
      dateOfFirstStack = Date.now() / 1000;
    });

    //Expect

    it("should store total staked", async () => {
      const storedData = await StakingInstance.stakers(newStaker, {
        from: newStaker,
      });
      expect(new BN(storedData.totalStaked / 1e18)).to.be.bignumber.equal(
        new BN(5)
      );
    });

    it("should store pool balance", async () => {
      const storedData = await StakingInstance.poolBalance({
        from: newStaker,
      });
      expect(new BN(storedData / 1e18)).to.be.bignumber.equal(new BN(5));
    });

    it("should store last deposit or claim date", async () => {
      const storedData = await StakingInstance.stakers(newStaker);
      expect(new BN(storedData.lastDepositOrClaim)).to.be.bignumber.equal(
        new BN(Date.now() / 1000)
      );
    });

    it("should store first time deposit", async () => {
      const storedData = await StakingInstance.stakers(newStaker);
      expect(new BN(storedData.firstTimeDeposit)).to.be.bignumber.equal(
        new BN(dateOfFirstStack)
      );
    });

    it("should new staker stored exist", async () => {
      const storedData = await StakingInstance.stakers(newStaker);
      expect(storedData.exists).to.be.true;
    });

    it("should newStaker is stocked in the array", async () => {
      const storedData = await StakingInstance.stakerList(0);
      expect(storedData).to.be.equal(newStaker);
    });

    //Revert

    it("should revert when transfering without msg.value", async () => {
      await expectRevert(
        StakingInstance.stake({
          from: newStaker,
          value: web3.utils.toWei("0", "ether"),
        }),
        "You have not sent any ETH"
      );
    });

    it("should revert when transfering without msg.value", async () => {
      await expectRevert(
        StakingInstance.stake({
          from: newStaker,
          value: web3.utils.toWei("0", "ether"),
        }),
        "You have not sent any ETH"
      );
    });
  });

  describe("Second stake for a staker", () => {
    before(async () => {
      let tokenContract = await DevToken.deployed();
      let tokenAddress = tokenContract.address;
      StakingInstance = await Staking.new(
        annualRewardRate,
        cooldown,
        minimumReward,
        tokenAddress,
        { from: owner }
      );

      await StakingInstance.stake({
        from: staker,
        value: web3.utils.toWei("10", "ether"),
      });
      await StakingInstance.stake({
        from: staker,
        value: web3.utils.toWei("10", "ether"),
      });
    });

    // Expect

    it("should store new balanc for totalStaked after second stake", async () => {
      const storedData = await StakingInstance.stakers(staker, {
        from: staker,
      });

      expect(new BN(storedData.totalStaked / 1e18)).to.be.bignumber.equal(
        new BN(20)
      );
    });

    it("should stored in pool balance", async () => {
      const storedData = await StakingInstance.poolBalance({
        from: staker,
      });

      expect(new BN(storedData / 1e18)).to.be.bignumber.equal(new BN(20));
    });

    it("should store last deposit or claim date", async () => {
      const storedData = await StakingInstance.stakers(staker);
      expect(new BN(storedData.lastDepositOrClaim)).to.be.bignumber.equal(
        new BN(Date.now() / 1000)
      );
    });

    it("should staker stored exist", async () => {
      const storedData = await StakingInstance.stakers(staker);
      expect(storedData.exists).to.be.true;
    });

    it("should newStaker is stocked in the array", async () => {
      const storedData = await StakingInstance.stakerList(0);
      expect(storedData).to.be.equal(staker);
    });

    it("should totalRewards staker are increase", async () => {
      const storedData = await StakingInstance.stakers(staker);
      setTimeout(() => {
        expect(storedData).to.be.bignumber.equal(new BN(1659873707));
      }, 5000);
    });

    // Revert

    it("should revert when transfering without msg.value", async () => {
      await expectRevert(
        StakingInstance.stake({
          from: staker,
          value: web3.utils.toWei("0", "ether"),
        }),
        "You have not sent any ETH"
      );
    });
  });

  describe("what's left of an old staker", async () => {
    before(async () => {
      let tokenContract = await DevToken.deployed();
      let tokenAddress = tokenContract.address;
      StakingInstance = await Staking.new(
        annualRewardRate,
        cooldown,
        minimumReward,
        tokenAddress,
        { from: owner }
      );
      await StakingInstance.stake({
        from: oldStaker,
        value: web3.utils.toWei("10", "ether"),
      });
      await StakingInstance.unstake({ from: oldStaker });
    });

    // Expect

    it("should store new balance for totalStaked after unstake", async () => {
      const storedData = await StakingInstance.stakers(oldStaker, {
        from: oldStaker,
      });

      expect(new BN(storedData.totalStaked)).to.be.bignumber.equal(new BN(0));
    });

    it("should stored in pool balance", async () => {
      const storedData = await StakingInstance.poolBalance({
        from: staker,
      });

      expect(new BN(storedData)).to.be.bignumber.equal(new BN(0));
    });

    it("should store last deposit or claim date", async () => {
      const storedData = await StakingInstance.stakers(oldStaker);
      expect(new BN(storedData.lastDepositOrClaim)).to.be.bignumber.equal(
        new BN(0)
      );
    });

    it("should old staker stored exist", async () => {
      const storedData = await StakingInstance.stakers(oldStaker);
      expect(storedData.exists).to.be.true;
    });

    it("should old staker all timme harvest is always ther", async () => {
      const storedData = await StakingInstance.stakers(oldStaker);
      expect(new BN(storedData.allTimeHarvested / 1e18)).to.be.bignumber.equal(
        new BN(10)
      );
    });

    // Revert

    //   it("should old staker can't unstake again");
  });
});

// web3.utils.fromWei('1', 'ether');
// Staker describe

//

// stats infos
// everybody can consult informations

// All event

// it("should emit event on staker restaking", async () => {
//   expectEvent(
//     await StakingInstance.stake({
//       from: staker,
//       value: web3.utils.toWei("5", "ether"),
//     }),
//     "StakingUpdate",
//     {
//       stakerAddress: staker,
//       totalStaked: web3.utils.fromWei("25", "ether"),
//       totalRewards: new BN(1659873707),
//     }
//   );
// });

// it("should emit event on staker added", async () => {
//   expectEvent(
//     await StakingInstance.stake({
//       from: newStaker,
//       value: web3.utils.toWei("5", "wei"),
//     }),
//     "StakerAdded",
//     { stakerAddress: newStaker, totalStaked: new BN(5) }
//   );
// });
